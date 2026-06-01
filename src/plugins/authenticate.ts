import { FastifyRequest, FastifyReply } from "fastify";

// prehandler
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(401).send({
      success: false,
      message: "Unauthorized",
    });
  }
};
