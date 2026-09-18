const Payment = require("../models/Payment");
const Order = require("../models/Order");

// @desc    Create payment record
// @route   POST /api/payments/create
const createPayment = async (req, res) => {
  try {
    const { orderId, paymentProvider } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // User can only pay for own order
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this order",
      });
    }

    if (order.paymentMethod !== "online") {
      return res.status(400).json({
        success: false,
        message: "This order does not require online payment",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This order is already paid",
      });
    }

    // Prevent duplicate active payment records
    const existingPayment = await Payment.findOne({
      order: order._id,
      status: "pending",
    });

    if (existingPayment) {
      return res.status(200).json({
        success: true,
        message: "Pending payment already exists",
        payment: existingPayment,
      });
    }

    const payment = await Payment.create({
      order: order._id,
      user: order.user,
      amount: order.totalAmount,
      currency: "INR",
      paymentMethod: "online",
      paymentProvider: paymentProvider || "razorpay",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify successful payment
// @route   POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const {
      paymentId,
      transactionId,
      providerOrderId,
    } = req.body;

    if (!paymentId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and transaction ID are required",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Only payment owner or admin can verify
    if (
      payment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this payment",
      });
    }

    if (payment.status === "success") {
      return res.status(400).json({
        success: false,
        message: "Payment is already verified",
      });
    }

    payment.status = "success";
    payment.transactionId = transactionId;
    payment.providerOrderId = providerOrderId || "";
    payment.paidAt = new Date();

    await payment.save();

    const order = await Order.findById(payment.order);

    if (order) {
      order.paymentStatus = "paid";

      if (order.orderStatus === "pending") {
        order.orderStatus = "confirmed";

        order.timeline.push({
          status: "confirmed",
          message: "Payment received and order confirmed",
          location: order.shippingAddress.city,
          timestamp: new Date(),
        });
      }

      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark payment as failed
// @route   PATCH /api/payments/:id/failed
const markPaymentFailed = async (req, res) => {
  try {
    const { failureReason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (
      payment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    payment.status = "failed";
    payment.failureReason =
      failureReason || "Payment failed";

    await payment.save();

    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: "failed",
    });

    res.status(200).json({
      success: true,
      message: "Payment marked as failed",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("order")
      .populate("user", "name email mobile");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (
      payment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPayment,
  verifyPayment,
  markPaymentFailed,
  getPaymentById,
};