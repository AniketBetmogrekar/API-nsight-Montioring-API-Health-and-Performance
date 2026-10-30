const express = require("express");
const { analyzeTelemetry } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all AI routes with authentication
router.use(protect);

router.post("/analyze", analyzeTelemetry);

module.exports = router;