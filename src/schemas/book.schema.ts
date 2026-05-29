import { z } from "zod";

// Schema for book body (create and update)
export const bookBodySchema = z.object({
  bookName: z.string().min(1).max(100),
  authorName: z.string().min(1).max(100),
  isbn: z
    .string()
    .regex(/^\d{10}$|^\d{13}$/, "ISBN must be exactly 10 or 13 digits"),
});

// Schema for id param
export const bookParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Full book schema (includes id, used for responses)
export const bookSchema = z.object({
  id: z.number(),
  bookName: z.string(),
  authorName: z.string(),
  isbn: z.string(),
});

// Inferred TypeScript types
export type BookBody = z.infer<typeof bookBodySchema>;
export type BookParam = z.infer<typeof bookParamSchema>;
export type Book = z.infer<typeof bookSchema>;
