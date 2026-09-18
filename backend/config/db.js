const mongoose = require("mongoose");

let isConnecting = false;
let reconnectTimer = null;

const connectDB = async (retries = 5, delay = 5000) => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });

        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (error) {
        console.error(
          `❌ MongoDB Connection Attempt ${attempt}/${retries} Error: ${error.message}`
        );

        if (attempt < retries) {
          console.log(`⏳ Retrying MongoDB connection in ${delay / 1000}s...`);
          await new Promise((res) => setTimeout(res, delay));
        } else {
          console.error(
            "⚠️ MongoDB connection failed after all attempts. Server will keep running and retry in background."
          );
        }
      }
    }
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on("disconnected", () => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  console.warn("⚠️ MongoDB disconnected. Attempting reconnect...");

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  reconnectTimer = setTimeout(() => {
    connectDB(3, 5000).catch((err) =>
      console.error("MongoDB reconnect error:", err.message)
    );
  }, 5000);
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

module.exports = connectDB;
