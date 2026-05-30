import { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { handlePrismaError } from "../utils/prismaErrors";

export const errorHandler = (
  err: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  request.log.error({ err }, "unhandled error");

  // Handle Prisma errors: unique constraint, record not found, foreign key violations etc.
  const prismaResponse = handlePrismaError(err, reply);
  if (prismaResponse) return prismaResponse;

  const fastifyErr = err as FastifyError;

  // Zod validation error: so if anything is wrong with the incoming request, zod automatically sends it here as 400
  if (fastifyErr.statusCode === 400) {
    return reply.code(400).send({
      success: false,
      message: "Validation failed",
      errors: (fastifyErr as any).validation ?? [],
    });
  }

  // Not found: this is for example a 404 like - route not found. fastify catches it and sends it here. this is not that 404 for example "book not found". book not found is handled in the controller.
  if (fastifyErr.statusCode === 404) {
    return reply.code(404).send({
      success: false,
      message: "Not found",
    });
  }

  // Everything else
  return reply.code(500).send({
    success: false,
    message: "Internal server error",
  });
};
