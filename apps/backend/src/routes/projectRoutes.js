const express = require("express");
const { protect, adminOrPM } = require("../middlewares/authMiddleware");
const {
  getProjects,
  createProject,
  getProject,
} = require("../controllers/projectController");
const validate = require("../middlewares/validationMiddleware");
const { createProjectSchema, projectIdParamSchema } = require("../validations");
const router = express.Router();

router.get("/", protect, getProjects);
router.get(
  "/:id",
  validate(projectIdParamSchema, "params"),
  protect,
  getProject,
);
router.post(
  "/create",
  validate(createProjectSchema),
  protect,
  adminOrPM,
  createProject,
);

module.exports = router;
