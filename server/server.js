require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/delivery", deliveryRoutes);

// ===============================
// TEST ROUTES
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fizzi Backend API is running",
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Fizzi API",
  });
});

// ===============================
// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error("❌ Express Error Handler:", err.stack || err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ===============================
// PROCESS-LEVEL CRASH GUARDS
// ===============================

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("⚠️ Uncaught Exception:", error);
});

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("🚀 Fizzi Backend Server Started");
      console.log(`🌐 Backend: http://localhost:${PORT}`);
      console.log(`📦 Products: http://localhost:${PORT}/api/products`);
    });
  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    app.listen(PORT, () => {
      console.log(`🌐 Backend started in degraded mode on port ${PORT}`);
    });
  }
};

startServer();