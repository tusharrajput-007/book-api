import { z } from "zod";
import { paginationSchema } from "../utils/pagination";

// Schema for student body (create and update)
export const studentBodySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  rollNo: z
    .string()
    .min(1, "Roll number is required")
    .max(20, "Roll number must be at most 20 characters"),
  phoneNo: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .max(15, "Phone number must be at most 15 characters")
    .regex(
      /^\+?\d+$/,
      "Phone number must contain only digits and optional + prefix",
    ),
  country: z
    .string()
    .min(1, "Country is required")
    .max(60, "Country must be at most 60 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .max(60, "State must be at most 60 characters"),
  city: z
    .string()
    .min(1, "City is required")
    .max(60, "City must be at most 60 characters"),
});

// Schema for id param
export const studentParamSchema = z.object({
  id: z.coerce
    .number({ message: "ID must be a number" })
    .int()
    .positive("ID must be a positive number"),
});

// Full student schema (for responses)
export const studentSchema = z.object({
  id: z.number(),
  name: z.string(),
  rollNo: z.string(),
  phoneNo: z.string(),
  photoFile: z.string().nullable(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Query schema for GET /students
export const studentQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

// Inferred TypeScript types
export type StudentBody = z.infer<typeof studentBodySchema>;
export type StudentParam = z.infer<typeof studentParamSchema>;
export type Student = z.infer<typeof studentSchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;
