const express = require("express");
const { protect, adminOrPM } = require("../middlewares/authMiddleware");
const {
  getProjects,
  createProject,
} = require("../controllers/projectController");
const validate = require("../middlewares/validationMiddleware");
const { createProjectSchema } = require("../validations");
const router = express.Router();

router.get("/", protect, getProjects);
router.post(
  "/create",
  validate(createProjectSchema),
  protect,
  adminOrPM,
  createProject,
);

module.exports = router;
