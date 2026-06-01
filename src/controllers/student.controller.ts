import { FastifyRequest, FastifyReply } from "fastify";
import { studentService } from "../services/student.service";
import {
  StudentBody,
  StudentParam,
  StudentQuery,
} from "../schemas/student.schema";
import { createModuleLogger } from "../utils/logger";

const listLogger = createModuleLogger("students/student-list");
const getByIdLogger = createModuleLogger("students/student-getbyid");
const createLogger = createModuleLogger("students/student-create");
const updateLogger = createModuleLogger("students/student-update");
const deleteLogger = createModuleLogger("students/student-delete");

export const studentController = {
  async getAll(
    request: FastifyRequest<{ Querystring: StudentQuery }>,
    reply: FastifyReply,
  ) {
    const result = await studentService.findAll(request.query);
    listLogger.info(
      { count: result.data.length, page: result.meta.page },
      "fetched all students",
    );
    return reply.send(result);
  },

  async getById(
    request: FastifyRequest<{ Params: StudentParam }>,
    reply: FastifyReply,
  ) {
    const student = await studentService.findById(request.params.id);
    if (!student) {
      getByIdLogger.warn({ id: request.params.id }, "student not found");
      return reply.code(404).send({ success: false, message: "Not found" });
    }
    getByIdLogger.info({ studentId: student.id }, "fetched student by id");
    return reply.send({ data: student });
  },

  async create(
    request: FastifyRequest<{ Body: StudentBody }>,
    reply: FastifyReply,
  ) {
    const student = await studentService.create(request.body);
    createLogger.info(
      { studentId: student.id, name: student.name },
      "student created",
    );
    return reply.code(201).send({ data: student });
  },

  async update(
    request: FastifyRequest<{ Params: StudentParam; Body: StudentBody }>,
    reply: FastifyReply,
  ) {
    const student = await studentService.update(
      request.params.id,
      request.body,
    );
    if (!student) {
      updateLogger.warn(
        { id: request.params.id },
        "student not found for update",
      );
      return reply.code(404).send({ success: false, message: "Not found" });
    }
    updateLogger.info({ studentId: student.id }, "student updated");
    return reply.send({ data: student });
  },

  async delete(
    request: FastifyRequest<{ Params: StudentParam }>,
    reply: FastifyReply,
  ) {
    await studentService.delete(request.params.id);
    deleteLogger.info({ studentId: request.params.id }, "student deleted");
    return reply.code(204).send();
  },
};
