import { Prisma } from "@prisma/client";
import { FastifyReply } from "fastify";

export const handlePrismaError = (err: unknown, reply: FastifyReply) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaErr = err as Prisma.PrismaClientKnownRequestError;
    switch (prismaErr.code) {
      case "P2002": {
        // Unique constraint violation
        const field =
          (prismaErr.meta?.target as string)?.split("_")[1] ?? "field";
        const message = `${field} already exists`;
        return reply.code(409).send({
          success: false,
          message,
          error: {
            code: "CONFLICT",
            message,
          },
        });
      }
      case "P2025": {
        // Record not found
        return reply.code(404).send({
          success: false,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            message: "Not found",
          },
        });
      }
      case "P2003": {
        // Foreign key constraint violation — record is referenced by another table
        const field = (prismaErr.meta?.field_name as string) ?? "";
        const isBook = field.toLowerCase().includes("book");
        const isStudent = field.toLowerCase().includes("student");

        const message = isBook
          ? "Book is currently issued and cannot be deleted"
          : isStudent
            ? "Student has an active issue and cannot be deleted"
            : "Record is referenced by another entry and cannot be deleted";

        return reply.code(409).send({
          success: false,
          message,
          error: {
            code: "CONFLICT",
            message,
          },
        });
      }
      default: {
        return null;
      }
    }
  }
  return null;
};
