const express = require("express");

const {
  getAssignedOrders,
  updateDeliveryStatus,
} = require("../controllers/deliveryController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All delivery routes require login
router.use(protect);

// Get assigned orders
router.get("/orders", getAssignedOrders);

// Update delivery status
router.patch("/orders/:id/status", updateDeliveryStatus);

module.exports = router;