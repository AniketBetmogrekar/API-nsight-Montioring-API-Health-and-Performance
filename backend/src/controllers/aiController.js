const Log = require("../models/Log");
const Endpoint = require("../models/Endpoint");

// @desc    Generate AI insights based on telemetry logs
// @route   POST /api/ai/analyze
// @access  Private
const analyzeTelemetry = async (req, res) => {
  try {
    const userEndpoints = await Endpoint.find({ user: req.user._id });
    const endpointIds = userEndpoints.map((e) => e._id);

    // Fetch recent failure logs
    const recentErrors = await Log.find({ endpoint: { $in: endpointIds }, status: "DOWN" })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate("endpoint", "name url");

    // Fetch slow endpoints (> 1000ms latency)
    const slowLogs = await Log.find({ endpoint: { $in: endpointIds }, responseTimeMs: {$gt: 1000 } })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate("endpoint", "name url");

    let recommendations = [];

    if (recentErrors.length > 0) {
      recentErrors.forEach((errLog) => {
        recommendations.push({
          type: "CRITICAL",
          title: `Failure Detected on ${errLog.endpoint?.name || "Target"}`,
          description: `HTTP status ${errLog.statusCode} returned from ${errLog.endpoint?.url}. Check server availability and SSL certificate expiration.`,
        });
      });
    }

    if (slowLogs.length > 0) {
      slowLogs.forEach((slowLog) => {
        recommendations.push({
          type: "WARNING",
          title: `Latency Degradation on ${slowLog.endpoint?.name || "Target"}`,
          description: `Response time spiked to ${slowLog.responseTimeMs}ms. Consider enabling database indexation or CDN caching on endpoint.`,
        });
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: "OPTIMAL",
        title: "All Systems Operational",
        description: "Zero errors or high-latency events detected across all registered endpoints in recent cycles.",
      });
    }

    res.status(200).json({ insights: recommendations });
  } catch (error) {
    res.status(500).json({ message: "AI analysis failed", error: error.message });
  }
};

module.exports = { analyzeTelemetry };