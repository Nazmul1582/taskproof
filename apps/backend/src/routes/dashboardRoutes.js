const express = require("express");
const {
  getKPIs,
  getCharts,
  getWorkload,
  getUpcoming,
} = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/kpis", protect, getKPIs);
router.get("/charts", protect, getCharts);
router.get("/workload", protect, getWorkload);
router.get("/upcoming", protect, getUpcoming);

module.exports = router;
