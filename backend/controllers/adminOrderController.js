const Order = require("../models/Order");
const User = require("../models/User");

// @desc    Get all orders
// @route   GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email mobile")
      .populate("deliveryAgent", "name mobile")
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

// @desc    Get single order by ID (Admin)
// @route   GET /api/admin/orders/:id
const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email mobile")
      .populate("items.product", "name image price")
      .populate("deliveryAgent", "name mobile");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
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

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const {
      orderStatus,
      message,
      location,
      estimatedDelivery,
    } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const statusUpper = orderStatus.toUpperCase();

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(statusUpper)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = statusUpper;

    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }

    if (!order.timeline) {
      order.timeline = [];
    }

    order.timeline.push({
      status: statusUpper,
      message: message || `Order status changed to ${statusUpper}`,
      location: location || "",
      timestamp: new Date(),
    });

    if (statusUpper === "DELIVERED") {
      order.deliveredAt = new Date();

      // COD payment is collected on delivery
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "PAID";
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update individual product delivery status
// @route   PATCH /api/admin/orders/:orderId/items/:productId/status
const updateOrderItemStatus = async (req, res) => {
  try {
    const {
      itemStatus,
      estimatedDelivery,
    } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const item = order.items.find(
      (item) =>
        item.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in this order",
      });
    }

    item.itemStatus = itemStatus;

    if (estimatedDelivery) {
      item.estimatedDelivery = new Date(
        estimatedDelivery
      );
    }

    if (itemStatus === "delivered") {
      item.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order item status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Assign delivery agent
// @route   PATCH /api/admin/orders/:id/assign-delivery
const assignDeliveryAgent = async (req, res) => {
  try {
    const { deliveryAgentId } = req.body;

    if (!deliveryAgentId) {
      return res.status(400).json({
        success: false,
        message: "Delivery agent ID is required",
      });
    }

    const deliveryAgent = await User.findById(
      deliveryAgentId
    );

    if (!deliveryAgent) {
      return res.status(404).json({
        success: false,
        message: "Delivery agent not found",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        deliveryAgent: deliveryAgentId,
      },
      {
        new: true,
      }
    ).populate("deliveryAgent", "name mobile");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery agent assigned successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateOrderItemStatus,
  assignDeliveryAgent,
};