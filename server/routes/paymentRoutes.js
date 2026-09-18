const express = require("express");

const {
  createPayment,
  verifyPayment,
  markPaymentFailed,
  getPaymentById,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All payment routes require login
router.use(protect);

// Create payment
router.post("/create", createPayment);

// Verify payment
router.post("/verify", verifyPayment);

// Mark payment as failed
router.patch("/:id/failed", markPaymentFailed);

// Get payment details
router.get("/:id", getPaymentById);

module.exports = router;