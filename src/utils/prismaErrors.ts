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
        // Foreign key constraint violation
        return reply.code(400).send({
          success: false,
          message: "Related record not found",
          error: {
            code: "BAD_REQUEST",
            message: "Related record not found",
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
