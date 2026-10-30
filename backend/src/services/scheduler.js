const cron = require("node-cron");
const Endpoint = require("../models/Endpoint");
const { pingEndpoint } = require("./pingService");

/**
 * Background Scheduler Engine
 * Runs every 30 seconds to fetch registered targets and execute health pings
 */
const startScheduler = () => {
  console.log("[Scheduler] Health Check Engine initiated (Running every 30s)...");

  // Schedule task using standard Cron syntax (Every 30 seconds)
  cron.schedule("*/30 * * * * *", async () => {
    try {
      const endpoints = await Endpoint.find({});

      if (!endpoints || endpoints.length === 0) {
        return;
      }

      // Execute ping checks concurrently for all registered targets
      const pingPromises = endpoints.map((endpoint) => pingEndpoint(endpoint));
      await Promise.allSettled(pingPromises);
    } catch (error) {
      console.error("[Scheduler Error]: Failed to fetch target endpoints", error.message);
    }
  });
};

module.exports = { startScheduler };