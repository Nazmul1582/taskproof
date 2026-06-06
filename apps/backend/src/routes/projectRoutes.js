const express = require("express");
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
} = require("../controllers/projectController");
const { protect, adminOrPM } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectIdParamSchema,
  addTeamMemberSchema,
} = require("../validations");

const router = express.Router();

router
  .route("/")
  .get(protect, validate(projectQuerySchema, "query"), getProjects)
  .post(protect, adminOrPM, validate(createProjectSchema), createProject);

router
  .route("/:id")
  .get(protect, validate(projectIdParamSchema, "params"), getProject)
  .put(
    protect,
    validate(projectIdParamSchema, "params"),
    validate(updateProjectSchema),
    updateProject,
  )
  .delete(protect, validate(projectIdParamSchema, "params"), deleteProject);

router.post(
  "/:id/members",
  protect,
  validate(projectIdParamSchema, "params"),
  validate(addTeamMemberSchema),
  addTeamMember,
);

router.delete(
  "/:id/members/:userId",
  protect,
  validate(projectIdParamSchema, "params"),
  removeTeamMember,
);

module.exports = router;
