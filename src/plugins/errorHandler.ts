import { FastifyError, FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
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

  // handle raw ZodError thrown from controllers (multipart validation)
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join(".") || "unknown",
      message: issue.message,
    }));

    const message =
      details.length > 0 ? details[0].message : "Validation failed";

    return reply.code(400).send({
      success: false,
      message,
      error: {
        code: "VALIDATION_ERROR",
        message,
        details,
      },
    });
  }

  // Handle custom errors thrown from services with statusCode and message
  const customErr = err as any;
  if (
    customErr.statusCode &&
    customErr.message &&
    !customErr.validation &&
    (customErr.statusCode === 400 ||
      customErr.statusCode === 404 ||
      customErr.statusCode === 409)
  ) {
    const code =
      customErr.statusCode === 409
        ? "CONFLICT"
        : customErr.statusCode === 404
          ? "NOT_FOUND"
          : "BAD_REQUEST";
    return reply.code(customErr.statusCode).send({
      success: false,
      message: customErr.message,
      error: {
        code,
        message: customErr.message,
      },
    });
  }

  const fastifyErr = err as FastifyError;

  // Zod validation error: so if anything is wrong with the incoming request, zod automatically sends it here as 400
  // if (fastifyErr.statusCode === 400) {
  //   const validation = (fastifyErr as any).validation ?? [];

  //   const details = validation.map((e: any) => ({
  //     field:
  //       e.instancePath.replace("/", "") ||
  //       e.params?.missingProperty ||
  //       "unknown",
  //     message: e.message,
  //   }));

  //   const message =
  //     details.length > 0 ? details[0].message : "Validation failed";

  //   return reply.code(400).send({
  //     success: false,
  //     message,
  //     error: {
  //       code: "VALIDATION_ERROR",
  //       message,
  //       details,
  //     },
  //   });
  // }
  if (fastifyErr.statusCode === 400) {
    const validation = (fastifyErr as any).validation ?? [];

    const details = validation.map((e: any) => {
      // strip path prefix like "body/password " from message
      const rawMessage = e.message as string;
      const cleanMessage = rawMessage.includes("/")
        ? rawMessage.substring(rawMessage.indexOf(" ") + 1)
        : rawMessage;

      return {
        field:
          e.instancePath.replace("/", "") ||
          e.params?.missingProperty ||
          "unknown",
        message: cleanMessage,
      };
    });

    const message =
      details.length > 0 ? details[0].message : "Validation failed";

    return reply.code(400).send({
      success: false,
      message,
      error: {
        code: "VALIDATION_ERROR",
        message,
        details,
      },
    });
  }

  // not found: route not found
  if (fastifyErr.statusCode === 404) {
    return reply.code(404).send({
      success: false,
      message: "Not found",
      error: {
        code: "NOT_FOUND",
        message: "Not found",
      },
    });
  }

  // everything else
  return reply.code(500).send({
    success: false,
    message: "Internal server error",
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
};
