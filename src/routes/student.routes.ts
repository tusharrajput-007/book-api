import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { studentController } from "../controllers/student.controller";
import {
  studentParamSchema,
  studentQuerySchema,
} from "../schemas/student.schema";
import { authenticate } from "../plugins/authenticate";

export const studentRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /students
  server.get(
    "/",
    {
      preHandler: authenticate,
      schema: {
        querystring: studentQuerySchema,
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
      },
    },
    studentController.getById,
  );

  // GET /students/:id/photo - public
  server.get(
    "/:id/photo",
    {
      schema: {
        params: studentParamSchema,
      },
    },
    studentController.getPhoto,
  );

  // POST /students - multipart, no body schema
  server.post(
    "/",
    {
      preHandler: authenticate,
    },
    studentController.create,
  );

  // PUT /students/:id - multipart, no body schema
  server.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        params: studentParamSchema,
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
      },
    },
    studentController.delete,
  );
};
