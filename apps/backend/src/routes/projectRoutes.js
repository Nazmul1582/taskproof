const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { getProjects } = require("../controllers/projectController");
const router = express.Router();

router.get("/", protect, getProjects);

module.exports = router;
