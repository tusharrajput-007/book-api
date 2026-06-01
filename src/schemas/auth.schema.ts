import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(45, "First name must be at most 45 characters"),
  middleName: z
    .string()
    .max(45, "Middle name must be at most 45 characters")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(45, "Last name must be at most 45 characters"),
  email: z
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(45, "Username must be at most 45 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be at most 64 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const userResponseSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  username: z.string(),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
