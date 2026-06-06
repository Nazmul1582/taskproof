const { z } = require("zod");

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),
  role: z.enum(["admin", "project_manager", "team_member"]).optional(),
});

const userIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

module.exports = {
  updateUserSchema,
  userIdParamSchema,
};
