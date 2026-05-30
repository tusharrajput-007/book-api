import { z } from "zod";
import { paginationSchema } from "../utils/pagination";

// Schema for book body (create and update)
export const bookBodySchema = z.object({
  bookName: z.string().min(1).max(100),
  authorName: z.string().min(1).max(100),
  isbn: z
    .string()
    .regex(/^\d{10}$|^\d{13}$/, "ISBN must be exactly 10 or 13 digits"),
});

// schema for id param
export const bookParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// full book schema (includes all fields from database). forr response
export const bookSchema = z.object({
  id: z.number(),
  bookName: z.string(),
  authorName: z.string(),
  isbn: z.string(),
  coverFile: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// query schema for GET /books (pagination + search)
export const bookQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

// inferred TypeScript types
export type BookBody = z.infer<typeof bookBodySchema>;
export type BookParam = z.infer<typeof bookParamSchema>;
export type Book = z.infer<typeof bookSchema>;
export type BookQuery = z.infer<typeof bookQuerySchema>;
