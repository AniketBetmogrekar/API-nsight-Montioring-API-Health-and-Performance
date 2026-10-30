const axios = require("axios");
const Log = require("../models/Log");
const Endpoint = require("../models/Endpoint");

/**
 * Trigger notification hooks when an endpoint fails or breaches latency thresholds
 */
const sendAlertNotification = (endpoint, reason, responseTimeMs) => {
  console.log(`\x1b[31m[ALERT TRIGGERED]\x1b[0m ${endpoint.name} (${endpoint.url})`);
  console.log(` └─ Reason: ${reason} | Response Time: ${responseTimeMs}ms`);
};

/**
 * Execute an HTTP ping check against a target endpoint and record telemetry to MongoDB
 */
const pingEndpoint = async (endpoint) => {
  let targetUrl = endpoint.url;

  // Resolve IPv6/IPv4 local loopback mismatch in Node.js v18+
  if (targetUrl.includes("localhost")) {
    targetUrl = targetUrl.replace("localhost", "127.0.0.1");
  }

  const startTime = Date.now();
  let statusCode = 500;
  let responseTimeMs = 0;
  let status = "DOWN";

  try {
    const response = await axios({
      method: endpoint.method || "GET",
      url: targetUrl,
      timeout: 10000, // 10-second request timeout
      headers: {
        "User-Agent": "API-Insight-Monitoring-Bot/1.0",
      },
    });

    responseTimeMs = Date.now() - startTime;
    statusCode = response.status;
    status = statusCode >= 200 && statusCode < 400 ? "UP" : "DOWN";
  } catch (error) {
    responseTimeMs = Date.now() - startTime;
    if (error.response) {
      statusCode = error.response.status;
    } else if (error.code === "ECONNABORTED") {
      statusCode = 408; // Request Timeout
    } else {
      statusCode = 500;
    }
    status = "DOWN";
  }

  try {
    // 1. Record log entry in MongoDB
    await Log.create({
      endpoint: endpoint._id,
      statusCode,
      responseTimeMs,
      status,
      timestamp: new Date(),
    });

    // 2. Evaluate alerting rules
    if (status === "DOWN") {
      sendAlertNotification(endpoint, `HTTP Status ${statusCode}`, responseTimeMs);
    } else if (endpoint.latencyThreshold && responseTimeMs > endpoint.latencyThreshold) {
      sendAlertNotification(
        endpoint,
        `High Latency Triggered (Exceeded ${endpoint.latencyThreshold}ms limit)`,
        responseTimeMs
      );
    }

    // 3. Update status on Endpoint document
    await Endpoint.findByIdAndUpdate(endpoint._id, { status });
  } catch (dbError) {
    console.error(`[PingService DB Error]: Failed to log ping for ${endpoint.name}`, dbError.message);
  }
};

module.exports = { pingEndpoint };