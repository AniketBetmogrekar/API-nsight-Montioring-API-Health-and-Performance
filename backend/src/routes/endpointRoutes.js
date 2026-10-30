const express = require("express");
const {
  createEndpoint,
  getEndpoints,
  deleteEndpoint,
  getStats,
  getChartData,
} = require("../controllers/endpointController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware applies authentication globally to all endpoint sub-routes
router.use(protect);

// Static named routes (Must come BEFORE parameterized :id routes)
router.get("/stats", getStats);
router.get("/chart-data", getChartData);

// Base Endpoints CRUD
router.route("/")
  .post(createEndpoint)
  .get(getEndpoints);

// Parameterized Endpoint Routes
router.route("/:id")
  .delete(deleteEndpoint);

module.exports = router;