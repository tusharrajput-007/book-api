import { z } from "zod";
import { paginationSchema } from "../utils/pagination";

// schema for creating an issue
export const issueBodySchema = z.object({
  bookId: z
    .number({ message: "Book ID is required" })
    .int()
    .positive("Book ID must be a positive number"),
  studentId: z
    .number({ message: "Student ID is required" })
    .int()
    .positive("Student ID must be a positive number"),
  issueDate: z.coerce.date({ message: "Issue date must be a valid date" }),
});

// schema for id param
export const issueParamSchema = z.object({
  id: z.coerce
    .number({ message: "ID must be a number" })
    .int()
    .positive("ID must be a positive number"),
});

// schema for issue with relations (book + student joined)
export const issueWithRelationsSchema = z.object({
  id: z.number(),
  issueDate: z.date(),
  returnDate: z.date().nullable(),
  status: z.enum(["ISSUED", "RETURNED"]),
  book: z.object({
    id: z.number(),
    bookName: z.string(),
    isbn: z.string(),
  }),
  student: z.object({
    id: z.number(),
    name: z.string(),
    rollNo: z.string(),
  }),
});

// Query schema for GET /issues
export const issueQuerySchema = paginationSchema.extend({
  status: z.enum(["ISSUED", "RETURNED"]).optional(),
});

// Inferred TypeScript types
export type IssueBody = z.infer<typeof issueBodySchema>;
export type IssueParam = z.infer<typeof issueParamSchema>;
export type IssueWithRelations = z.infer<typeof issueWithRelationsSchema>;
export type IssueQuery = z.infer<typeof issueQuerySchema>;
