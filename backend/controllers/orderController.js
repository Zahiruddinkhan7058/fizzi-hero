const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Create Order
const createOrder = async (req, res) => {
  try {
    const {
      customer,
      shippingAddress,
      paymentMethod = "COD",
    } = req.body;

    if (
      !customer?.name ||
      !customer?.email ||
      !customer?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete customer and delivery details are required",
      });
    }

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    // Check if cart contains any stale items (product was deleted from DB / reseeded)
    const staleItems = cart.items.filter((item) => !item.product);
    if (staleItems.length > 0) {
      // Prune ONLY the invalid/stale items from MongoDB cart; valid products remain untouched
      cart.items = cart.items.filter((item) => item.product != null);
      await cart.save();

      return res.status(400).json({
        success: false,
        message: "A product in your cart is no longer available and has been removed. Please review your cart before placing the order.",
        staleProductFound: true,
      });
    }

    // If backend cart is empty but client passed items, validate and sync them
    if (
      cart.items.length === 0 &&
      Array.isArray(req.body.items) &&
      req.body.items.length > 0
    ) {
      let hasInvalidItem = false;
      const validItemsToSync = [];

      for (const item of req.body.items) {
        const prodId = item.product?._id || item.product || item.productId;
        if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
          const productDoc = await Product.findById(prodId);
          if (productDoc) {
            validItemsToSync.push({
              product: prodId,
              quantity: Math.max(1, Number(item.quantity) || 1),
            });
          } else {
            hasInvalidItem = true;
          }
        } else {
          hasInvalidItem = true;
        }
      }

      if (hasInvalidItem) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists in our catalog. Please update your cart.",
          staleProductFound: true,
        });
      }

      if (validItemsToSync.length > 0) {
        cart.items = validItemsToSync;
        await cart.save();
        cart = await Cart.findById(cart._id).populate("items.product");
      }
    }

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        // Clean up and return 400
        cart.items = cart.items.filter((it) => it.product != null);
        await cart.save();

        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available. Please review your cart.",
          staleProductFound: true,
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock (${product.stock} available)`,
        });
      }

      subtotal += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || "",
      });
    }

    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const totalAmount = subtotal + deliveryCharge;

    const order = await Order.create({
      orderNumber: `FIZZI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      user: req.user._id,
      customer: {
        name: customer.name.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone.trim(),
      },

      shippingAddress: {
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },

      items: orderItems,

      subtotal,
      deliveryCharge,
      totalAmount,

      paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
    });

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    // Clear cart in database
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const userEmail = (req.user.email || "").toLowerCase().trim();

    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { "customer.email": userEmail },
        { "customer.email": req.user.email },
      ],
    })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const userEmail = (req.user.email || "").toLowerCase().trim();
    const isOwner =
      (order.user && order.user.toString() === req.user._id.toString()) ||
      (order.customer?.email && order.customer.email.toLowerCase().trim() === userEmail);

    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Track order
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const userEmail = (req.user.email || "").toLowerCase().trim();
    const isOwner =
      (order.user && order.user.toString() === req.user._id.toString()) ||
      (order.customer?.email && order.customer.email.toLowerCase().trim() === userEmail);

    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to track this order",
      });
    }

    res.status(200).json({
      success: true,
      tracking: {
        orderId: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
};