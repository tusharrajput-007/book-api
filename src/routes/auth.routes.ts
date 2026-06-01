import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { authController } from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  userResponseSchema,
} from "../schemas/auth.schema";
import { authenticate } from "../plugins/authenticate";
import { z } from "zod";

export const authRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /auth/register
  server.post(
    "/register",
    {
      schema: {
        body: registerSchema,
        response: {
          201: z.object({ data: userResponseSchema }),
        },
      },
    },
    authController.register,
  );

  // POST /auth/login
  server.post(
    "/login",
    {
      schema: {
        body: loginSchema,
        response: {
          200: z.object({
            data: z.object({
              token: z.string(),
              user: userResponseSchema,
            }),
          }),
        },
      },
    },
    authController.login,
  );

  // GET /auth/me (protected)
  server.get(
    "/me",
    {
      preHandler: authenticate,
      schema: {
        response: {
          200: z.object({ data: userResponseSchema }),
        },
      },
    },
    authController.me,
  );
};
