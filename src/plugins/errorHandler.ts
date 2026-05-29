import { FastifyError, FastifyRequest, FastifyReply } from "fastify";

export const errorHandler = (
  err: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  request.log.error({ err }, "unhandled error");

  // Zod validation error: so if anything is wrong with the incoming request, zod automatically sends it here as 400
  if (err.statusCode === 400) {
    return reply.code(400).send({
      success: false,
      message: "Validation failed",
      errors: (err as any).validation ?? [],
    });
  }

  // Not found: this is for example a 404 like - route not found. fastify catches it and sends it here. this is not that 404 for example "book not found". book not found is handled in the controller.
  if (err.statusCode === 404) {
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
