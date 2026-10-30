const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const endpointRoutes = require("./routes/endpointRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { startScheduler } = require("./services/scheduler");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/endpoints", endpointRoutes);
app.use("/api/ai", aiRoutes);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "API Insight backend service is operational",
    timestamp: new Date().toISOString(),
  });
});

// Database Connection & Server Initialization
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  startScheduler();
  app.listen(PORT, () => {
    console.log(`[API Insight] Backend running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
});