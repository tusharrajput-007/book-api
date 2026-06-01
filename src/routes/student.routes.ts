import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { studentController } from "../controllers/student.controller";
import {
  studentBodySchema,
  studentParamSchema,
  studentSchema,
  studentQuerySchema,
} from "../schemas/student.schema";
import { authenticate } from "../plugins/authenticate";
import { z } from "zod";

export const studentRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /students
  server.get(
    "/",
    {
      preHandler: authenticate,
      schema: {
        querystring: studentQuerySchema,
        response: {
          200: z.object({
            data: z.array(studentSchema),
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
    studentController.getAll,
  );

  // GET /students/:id
  server.get(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        params: studentParamSchema,
        response: { 200: z.object({ data: studentSchema }) },
      },
    },
    studentController.getById,
  );

  // POST /students
  server.post(
    "/",
    {
      preHandler: authenticate,
      schema: {
        body: studentBodySchema,
        response: { 201: z.object({ data: studentSchema }) },
      },
    },
    studentController.create,
  );

  // PUT /students/:id
  server.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        params: studentParamSchema,
        body: studentBodySchema,
        response: { 200: z.object({ data: studentSchema }) },
      },
    },
    studentController.update,
  );

  // DELETE /students/:id
  server.delete(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        params: studentParamSchema,
        response: { 204: z.object({}) },
      },
    },
    studentController.delete,
  );
};
