const { z } = require("zod");

// Create task validation
const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(200, "Task title cannot exceed 200 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .trim(),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID format"),
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
  dueDate: z
    .string()
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    })
    .refine((date) => date > new Date(), {
      message: "Due date must be a future date",
    }),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

// Update task validation
const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters")
    .max(200, "Task title cannot exceed 200 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    .optional(),
  dueDate: z
    .string()
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    })
    .optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
});

// Task query validation (for filtering)
const taskQuerySchema = z.object({
  projectId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID format")
    .optional(),
  status: z.enum(["todo", "in_progress", "completed"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    .optional(),
  search: z.string().max(100).optional(),
  page: z
    .string()
    .transform((str) => parseInt(str))
    .refine((num) => !isNaN(num) && num >= 1, {
      message: "Page must be a positive number",
    })
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((str) => parseInt(str))
    .refine((num) => !isNaN(num) && num >= 1 && num <= 100, {
      message: "Limit must be between 1 and 100",
    })
    .optional()
    .default("10"),
});

// Update task status validation
const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "completed"], {
    required_error: "Status is required",
  }),
});

// Task ID param validation
const taskIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID format"),
});

// Comment validation
const createCommentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment text is required")
    .max(300, "Comment cannot exceed 500 characters")
    .trim(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  updateTaskStatusSchema,
  taskIdParamSchema,
  createCommentSchema,
};
