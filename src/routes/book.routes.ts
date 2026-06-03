import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { bookController } from "../controllers/book.controller";
import { bookParamSchema, bookQuerySchema } from "../schemas/book.schema";
import { authenticate } from "../plugins/authenticate";
import { z } from "zod";

export const bookRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /books/export.xlsx
  server.get(
    "/export.xlsx",
    {
      preHandler: authenticate,
      schema: {
        querystring: z.object({ search: z.string().optional() }),
      },
    },
    bookController.exportXlsx,
  );

  // GET /books/export.csv
  server.get(
    "/export.csv",
    {
      preHandler: authenticate,
      schema: {
        querystring: z.object({ search: z.string().optional() }),
      },
    },
    bookController.exportCsv,
  );

  // GET /books
  server.get(
    "/",
    {
      preHandler: authenticate,
      schema: {
        querystring: bookQuerySchema,
      },
    },
    bookController.getAll,
  );

  // GET /books/:id/cover
  server.get(
    "/:id/cover",
    {
      schema: { params: bookParamSchema },
    },
    bookController.getCover,
  );

  // GET /books/:id/details.pdf
  server.get(
    "/:id/details.pdf",
    {
      preHandler: authenticate,
      schema: { params: bookParamSchema },
    },
    bookController.exportPdf,
  );

  // GET /books/:id
  server.get(
    "/:id",
    {
      preHandler: authenticate,
      schema: { params: bookParamSchema },
    },
    bookController.getById,
  );

  // POST /books - multipart, no body schema
  server.post(
    "/",
    {
      preHandler: authenticate,
    },
    bookController.create,
  );

  // PUT /books/:id - multipart, no body schema
  server.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: { params: bookParamSchema },
    },
    bookController.update,
  );

  // DELETE /books/:id
  server.delete(
    "/:id",
    {
      preHandler: authenticate,
      schema: { params: bookParamSchema },
    },
    bookController.delete,
  );
};
