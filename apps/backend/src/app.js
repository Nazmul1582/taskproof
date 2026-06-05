const express = require("express");
const cors = require("cors");
const app = express();
const errorMiddleware = require("./middlewares/errorMiddleware");

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use(errorMiddleware);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "TaskProof API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("/*path", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
