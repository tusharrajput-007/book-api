import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { authController } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { authenticate } from "../plugins/authenticate";

export const authRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /auth/register
  server.post(
    "/register",
    {
      schema: {
        body: registerSchema,
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
      },
    },
    authController.login,
  );

  // GET /auth/me (protected)
  server.get(
    "/me",
    {
      preHandler: authenticate,
    },
    authController.me,
  );

  // GET /auth/google/callback - google redirects here after user approves
  server.get("/google/callback", {}, authController.googleCallback);
};
