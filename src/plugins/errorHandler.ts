import { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { handlePrismaError } from "../utils/prismaErrors";

export const errorHandler = (
  err: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  request.log.error({ err }, "unhandled error");

  // handle Prisma errors: unique constraint, record not found, foreign key violations etc.
  const prismaResponse = handlePrismaError(err, reply);
  if (prismaResponse) return prismaResponse;

  // Handle custom errors thrown from services with statusCode and message
  const customErr = err as any;
  if (
    customErr.statusCode &&
    customErr.message &&
    (customErr.statusCode === 400 ||
      customErr.statusCode === 404 ||
      customErr.statusCode === 409)
  ) {
    return reply.code(customErr.statusCode).send({
      success: false,
      message: customErr.message,
    });
  }

  const fastifyErr = err as FastifyError;

  // Zod validation error: so if anything is wrong with the incoming request, zod automatically sends it here as 400
  if (fastifyErr.statusCode === 400) {
    const errors = ((fastifyErr as any).validation ?? []).map((e: any) => ({
      field:
        e.instancePath.replace("/", "") ||
        e.params?.missingProperty ||
        "unknown",
      message: e.message,
    }));

    return reply.code(400).send({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // not found: this is for example a 404 like - route not found. fastify catches it and sends it here. this is not that 404 for example "book not found". book not found is handled in the controller.
  if (fastifyErr.statusCode === 404) {
    return reply.code(404).send({
      success: false,
      message: "Not found",
    });
  }

  // everything else
  return reply.code(500).send({
    success: false,
    message: "Internal server error",
  });
};
