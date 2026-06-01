import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { issueController } from "../controllers/issue.controller";
import {
  issueBodySchema,
  issueParamSchema,
  issueWithRelationsSchema,
  issueQuerySchema,
} from "../schemas/issue.schema";
import { authenticate } from "../plugins/authenticate";
import { z } from "zod";

export const issueRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /issues
  server.get(
    "/",
    {
      preHandler: authenticate,
      schema: {
        querystring: issueQuerySchema,
        response: {
          200: z.object({
            data: z.array(issueWithRelationsSchema),
            meta: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
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
        response: {
          201: z.object({ data: issueWithRelationsSchema }),
        },
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
        response: {
          200: z.object({ data: issueWithRelationsSchema }),
        },
      },
    },
    issueController.returnBook,
  );
};
