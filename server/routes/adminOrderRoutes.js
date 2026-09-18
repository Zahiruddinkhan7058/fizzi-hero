const express = require("express");

const {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateOrderItemStatus,
  assignDeliveryAgent,
} = require("../controllers/adminOrderController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require admin login
router.use(protect);
router.use(authorize("admin"));

// Get all orders
router.get("/", getAllOrders);

// Get single order by ID
router.get("/:id", getAdminOrderById);

// Update complete order status
router.patch("/:id/status", updateOrderStatus);

// Update individual product status
router.patch(
  "/:orderId/items/:productId/status",
  updateOrderItemStatus
);

// Assign delivery agent
router.patch(
  "/:id/assign-delivery",
  assignDeliveryAgent
);

module.exports = router;