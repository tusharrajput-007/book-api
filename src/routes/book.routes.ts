import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { bookController } from "../controllers/book.controller";
import {
  bookBodySchema,
  bookParamSchema,
  bookSchema,
  bookQuerySchema,
} from "../schemas/book.schema";
import { authenticate } from "../plugins/authenticate";
import { z } from "zod";

export const bookRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /books
  server.get(
    "/",
    {
      preHandler: authenticate,
      schema: {
        querystring: bookQuerySchema,
        response: {
          200: z.object({
            data: z.array(bookSchema),
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
    bookController.getAll,
  );

  // GET /books/:id
  server.get(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        params: bookParamSchema,
        response: { 200: z.object({ data: bookSchema }) },
      },
    },
    bookController.getById,
  );

  // POST /books
  server.post(
    "/",
    {
      preHandler: authenticate,
      schema: {
        body: bookBodySchema,
        response: { 201: z.object({ data: bookSchema }) },
      },
    },
    bookController.create,
  );

  // PUT /books/:id
  server.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        params: bookParamSchema,
        body: bookBodySchema,
        response: { 200: z.object({ data: bookSchema }) },
      },
    },
    bookController.update,
  );

  // DELETE /books/:id
  server.delete(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        params: bookParamSchema,
        response: { 204: z.object({}) },
      },
    },
    bookController.delete,
  );
};
