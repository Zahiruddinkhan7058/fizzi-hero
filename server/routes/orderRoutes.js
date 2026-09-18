const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

// All order routes require login
router.use(protect);

// Create order
router.post("/", createOrder);

// Get logged-in user's orders
router.get("/", getMyOrders);
router.get("/my-orders", getMyOrders);

// Get single order
router.get("/:id", getOrderById);

// Track order
router.get("/:id/tracking", trackOrder);

module.exports = router;