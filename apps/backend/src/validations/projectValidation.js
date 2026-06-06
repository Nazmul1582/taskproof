const { z } = require("zod");

// Create project validation
const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description cannot exceed 300 characters")
    .trim(),
  deadline: z
    .string()
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    })
    .refine((date) => date > new Date(), {
      message: "Deadline must be a future date",
    }),
  status: z
    .enum(["active", "completed", "on_hold"])
    .default("active")
    .optional(),
});

// Update project validation
const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name cannot exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description cannot exceed 300 characters")
    .trim()
    .optional(),
  deadline: z
    .string()
    .transform((str) => new Date(str))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    })
    .refine((date) => date > new Date(), {
      message: "Deadline must be a future date",
    })
    .optional(),
  status: z.enum(["active", "completed", "on_hold"]).optional(),
});

// Project query validation (for filtering)
const projectQuerySchema = z.object({
  status: z.enum(["active", "completed", "on_hold"]).optional(),
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

// Project ID param validation
const projectIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID format"),
});

// Add team member validation
const addTeamMemberSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectIdParamSchema,
  addTeamMemberSchema,
};
