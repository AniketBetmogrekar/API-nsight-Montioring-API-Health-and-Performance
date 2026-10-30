const Endpoint = require("../models/Endpoint");
const Log = require("../models/Log");

// @desc    Register a new target endpoint
// @route   POST /api/endpoints
// @access  Private
const createEndpoint = async (req, res) => {
  try {
    const { name, url, method, frequency } = req.body;

    const endpoint = await Endpoint.create({
      user: req.user._id,
      name,
      url,
      method,
      frequency,
    });

    res.status(201).json(endpoint);
  } catch (error) {
    res.status(500).json({ message: "Error registering endpoint", error: error.message });
  }
};

// @desc    Get all endpoints for logged-in user
// @route   GET /api/endpoints
// @access  Private
const getEndpoints = async (req, res) => {
  try {
    const endpoints = await Endpoint.find({ user: req.user._id });
    res.status(200).json(endpoints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching endpoints", error: error.message });
  }
};

// @desc    Delete a monitored endpoint
// @route   DELETE /api/endpoints/:id
// @access  Private
const deleteEndpoint = async (req, res) => {
  try {
    const endpoint = await Endpoint.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!endpoint) {
      return res.status(404).json({ message: "Endpoint not found" });
    }

    res.status(200).json({ message: "Endpoint removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting endpoint", error: error.message });
  }
};

// @desc    Get aggregated telemetry metrics for dashboard cards
// @route   GET /api/endpoints/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const userEndpoints = await Endpoint.find({ user: req.user._id }).select("_id");
    const endpointIds = userEndpoints.map((e) => e._id);

    const totalRequests = await Log.countDocuments({ endpoint: { $in: endpointIds } });

    if (totalRequests === 0) {
      return res.status(200).json({
        totalRequests: 0,
        avgResponseTime: "0ms",
        errorRate: "0.00%",
        successRate: "100.00%",
      });
    }

    const avgResponse = await Log.aggregate([
      { $match: { endpoint: {$in: endpointIds } } },
      { $group: { _id: null, avgMs: { $avg: "$responseTimeMs" } } },
    ]);

    const errorCount = await Log.countDocuments({
      endpoint: { $in: endpointIds },
      status: "DOWN",
    });

    const avgMs = avgResponse.length > 0 ? Math.round(avgResponse[0].avgMs) : 0;
    const errorRateVal = ((errorCount / totalRequests) * 100).toFixed(2);
    const successRateVal = (100 - parseFloat(errorRateVal)).toFixed(2);

    res.status(200).json({
      totalRequests,
      avgResponseTime: `${avgMs}ms`,
      errorRate: `${errorRateVal}%`,
      successRate: `${successRateVal}%`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics", error: error.message });
  }
};

// @desc    Get live aggregation chart data directly from MongoDB
// @route   GET /api/endpoints/chart-data
// @access  Private
const getChartData = async (req, res) => {
  try {
    const userEndpoints = await Endpoint.find({ user: req.user._id }).select("_id name method");
    const endpointIds = userEndpoints.map((e) => e._id);

    // 1. Fetch recent ping logs for traffic time-series
    const logs = await Log.find({ endpoint: { $in: endpointIds } })
      .sort({ timestamp: -1 })
      .limit(20)
      .populate("endpoint", "name");

    const trafficOverview = logs.reverse().map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      requests: 1,
      errors: log.status === "DOWN" ? 1 : 0,
      responseTime: log.responseTimeMs,
    }));

    // 2. Count top endpoints by total ping volume
    const topEndpoints = await Log.aggregate([
      { $match: { endpoint: {$in: endpointIds } } },
      { $group: { _id: "$endpoint", totalPings: { $sum: 1 } } },       {$sort: { totalPings: -1 } },
      { $limit: 3 },       {$lookup: {
          from: "endpoints",
          localField: "_id",
          foreignField: "_id",
          as: "details",
        },
      },
      { $unwind: "$details" },
      {
        $project: {
          name: "$details.name",
          url: "$details.url",
          volume: "$totalPings",
        },
      },
    ]);

    // 3. Distribution by HTTP Method
    const methodDistribution = await Endpoint.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$method", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      trafficOverview,
      topEndpoints,
      methodDistribution: methodDistribution.map((m) => ({
        name: m._id,
        value: m.count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chart analytics", error: error.message });
  }
};

module.exports = {
  createEndpoint,
  getEndpoints,
  deleteEndpoint,
  getStats,
  getChartData,
};