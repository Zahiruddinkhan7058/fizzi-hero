const express = require("express");

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
} = require("../controllers/adminController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All admin routes require login + admin role
router.use(protect);
router.use(authorize("admin"));

// Users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);

module.exports = router;