const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  endpoint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Endpoint",
    required: true,
  },
  statusCode: {
    type: Number,
    required: true,
  },
  responseTimeMs: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["UP", "DOWN"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Log", logSchema);