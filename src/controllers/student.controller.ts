import { FastifyRequest, FastifyReply } from "fastify";
import { studentService } from "../services/student.service";
import {
  studentBodySchema,
  StudentParam,
  StudentQuery,
} from "../schemas/student.schema";
import { createModuleLogger } from "../utils/logger";
import { saveFile, deleteFile } from "../utils/fileUpload";

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
    // return reply.ok(result);
    return reply.send({ success: true, ...result });
  },

  async getById(
    request: FastifyRequest<{ Params: StudentParam }>,
    reply: FastifyReply,
  ) {
    const student = await studentService.findById(request.params.id);
    if (!student) {
      getByIdLogger.warn({ id: request.params.id }, "student not found");
      return reply.code(404).send({
        success: false,
        message: "Not found",
        error: { code: "NOT_FOUND", message: "Not found" },
      });
    }
    getByIdLogger.info({ studentId: student.id }, "fetched student by id");
    return reply.ok(student);
  },

  // getPhoto
  async getPhoto(
    request: FastifyRequest<{ Params: StudentParam }>,
    reply: FastifyReply,
  ) {
    const student = await studentService.findById(request.params.id);
    if (!student) {
      return reply.code(404).send({
        success: false,
        message: "Not found",
        error: { code: "NOT_FOUND", message: "Not found" },
      });
    }
    if (!student.photoFile) {
      return reply.code(404).send({
        success: false,
        message: "This student has no photo",
        error: { code: "NOT_FOUND", message: "This student has no photo" },
      });
    }

    const { createReadStream } = await import("fs");
    const { extname } = await import("path");

    const ext = extname(student.photoFile);
    const filename = `${student.name}${ext}`;

    reply.header("Content-Disposition", `inline; filename="${filename}"`);
    reply.header("Content-Type", ext === ".png" ? "image/png" : "image/jpeg");

    return reply.send(createReadStream(student.photoFile));
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const fields: Record<string, string> = {};
    let photoFile: string | undefined;

    // iterate over all multipart parts
    for await (const part of request.parts()) {
      if (part.type === "file") {
        // only process if a file was actually selected
        if (part.fieldname === "photo" && part.filename) {
          photoFile = await saveFile(part, "students");
        } else {
          // drain empty file fields to prevent hanging
          await part.toBuffer();
        }
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    // validate fields using Zod schema
    const parsed = studentBodySchema.safeParse(fields);
    if (!parsed.success) throw parsed.error;

    const student = await studentService.create(parsed.data, photoFile);

    createLogger.info(
      { studentId: student.id, name: student.name },
      "student created",
    );
    return reply.ok(student, 201);
  },

  async update(
    request: FastifyRequest<{ Params: StudentParam }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    // check if student exists
    const existing = await studentService.findById(id);
    if (!existing) {
      updateLogger.warn({ id }, "student not found for update");
      return reply.code(404).send({
        success: false,
        message: "Not found",
        error: { code: "NOT_FOUND", message: "Not found" },
      });
    }

    const fields: Record<string, string> = {};
    let photoFile: string | undefined;

    // iterate over all multipart parts
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (part.fieldname === "photo" && part.filename) {
          // delete old photo if exists
          if (existing.photoFile) await deleteFile(existing.photoFile);
          photoFile = await saveFile(part, "students");
        } else {
          await part.toBuffer();
        }
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    // validate fields using Zod schema
    const parsed = studentBodySchema.safeParse(fields);
    if (!parsed.success) throw parsed.error;

    const student = await studentService.update(id, parsed.data, photoFile);

    updateLogger.info({ studentId: student.id }, "student updated");
    return reply.ok(student);
  },

  async delete(
    request: FastifyRequest<{ Params: StudentParam }>,
    reply: FastifyReply,
  ) {
    // delete photo file if exists
    const student = await studentService.findById(request.params.id);
    if (student?.photoFile) await deleteFile(student.photoFile);

    await studentService.delete(request.params.id);
    deleteLogger.info({ studentId: request.params.id }, "student deleted");
    return reply.code(204).send();
  },
};
