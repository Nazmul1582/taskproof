const express = require("express");
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  deleteComment,
} = require("../controllers/taskController");
const { protect, adminOrPM } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  updateTaskStatusSchema,
  taskIdParamSchema,
  createCommentSchema,
} = require("../validations");

const router = express.Router();

router
  .route("/")
  .get(protect, validate(taskQuerySchema, "query"), getTasks)
  .post(protect, adminOrPM, validate(createTaskSchema), createTask);

router
  .route("/:id")
  .get(protect, validate(taskIdParamSchema, "params"), getTask)
  .put(
    protect,
    validate(taskIdParamSchema, "params"),
    validate(updateTaskSchema),
    updateTask,
  )
  .delete(protect, validate(taskIdParamSchema, "params"), deleteTask);

// Task status update
router.patch(
  "/:id/status",
  protect,
  validate(taskIdParamSchema, "params"),
  validate(updateTaskStatusSchema),
  updateTaskStatus,
);

router.post(
  "/:taskId/comments",
  protect,
  validate(createCommentSchema),
  addComment,
);

router.delete("/:taskId/comments/:commentId", protect, deleteComment);

module.exports = router;
