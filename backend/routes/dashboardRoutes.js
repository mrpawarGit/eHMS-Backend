const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

// Dashboard is protected, available to all logged-in users
router.get("/", protect, getDashboardStats);

module.exports = router;
