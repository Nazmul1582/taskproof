const { z } = require("zod");

// Signup validation
const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name cannot exceed 150 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Login validation
const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

// Demo login validation
const demoLoginSchema = z.object({
  role: z
    .enum(["admin", "project_manager", "team_member"])
    .optional()
    .default("team_member"),
});

module.exports = {
  signupSchema,
  loginSchema,
  demoLoginSchema,
};
