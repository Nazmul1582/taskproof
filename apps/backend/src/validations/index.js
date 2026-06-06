const {
  signupSchema,
  loginSchema,
  demoLoginSchema,
} = require("./authValidation");

const { updateUserSchema, userIdParamSchema } = require("./userValidation");

const {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectIdParamSchema,
  addTeamMemberSchema,
} = require("./projectValidation");

const {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  updateTaskStatusSchema,
  taskIdParamSchema,
  createCommentSchema,
} = require("./taskValidation");

module.exports = {
  // Auth validations
  signupSchema,
  loginSchema,
  demoLoginSchema,

  // User validations
  updateUserSchema,
  userIdParamSchema,

  // Project validations
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectIdParamSchema,
  addTeamMemberSchema,

  // Task validations
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  updateTaskStatusSchema,
  taskIdParamSchema,
  createCommentSchema,
};
