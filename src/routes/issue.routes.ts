import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { issueController } from "../controllers/issue.controller";
import {
  issueBodySchema,
  issueParamSchema,
  issueQuerySchema,
} from "../schemas/issue.schema";
import { authenticate } from "../plugins/authenticate";

export const issueRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /issues
  server.get(
    "/",
    {
      preHandler: authenticate,
      schema: {
        querystring: issueQuerySchema,
      },
    },
    issueController.getAll,
  );

  // POST /issues
  server.post(
    "/",
    {
      preHandler: authenticate,
      schema: {
        body: issueBodySchema,
      },
    },
    issueController.create,
  );

  // PATCH /issues/:id/return
  server.patch(
    "/:id/return",
    {
      preHandler: authenticate,
      schema: {
        params: issueParamSchema,
      },
    },
    issueController.returnBook,
  );
};
