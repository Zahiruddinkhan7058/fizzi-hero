const Order = require("../models/Order");

// @desc    Get delivery agent assigned orders
// @route   GET /api/delivery/orders
const getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryAgent: req.user._id,
    })
      .populate("user", "name mobile")
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

// @desc    Update delivery order status
// @route   PATCH /api/delivery/orders/:id/status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderStatus, message, location } = req.body;

    const validStatuses = [
      "out_for_delivery",
      "delivered",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      deliveryAgent: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Assigned order not found",
      });
    }

    order.orderStatus = orderStatus;

    order.timeline.push({
      status: orderStatus,
      message:
        message ||
        `Order status changed to ${orderStatus}`,
      location: location || "",
      timestamp: new Date(),
    });

    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();

      if (order.paymentMethod === "cod") {
        order.paymentStatus = "paid";
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
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
  getAssignedOrders,
  updateDeliveryStatus,
};