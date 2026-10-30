const mongoose = require("mongoose");

const endpointSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  method: {
    type: String,
    enum: ["GET", "POST", "PUT", "DELETE"],
    default: "GET",
  },
  frequency: { type: Number, default: 60 }, // Interval in seconds
  latencyThreshold: { type: Number, default: 2000 }, // Max ms before triggering warning
  alertEmail: { type: String }, // Optional override email for notifications
  status: { type: String, enum: ["UP", "DOWN", "PENDING"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Endpoint", endpointSchema);
