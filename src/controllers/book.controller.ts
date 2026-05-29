import { FastifyRequest, FastifyReply } from "fastify";
import { bookService } from "../services/book.service";
import { BookBody, BookParam } from "../schemas/book.schema";
import { createModuleLogger } from "../utils/logger";

const listLogger = createModuleLogger("book-list");
const getByIdLogger = createModuleLogger("book-getbyid");
const createLogger = createModuleLogger("book-create");
const updateLogger = createModuleLogger("book-update");
const deleteLogger = createModuleLogger("book-delete");

export const bookController = {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const books = bookService.findAll();
    listLogger.info({ count: books.length }, "fetched all books");
    return reply.send({ data: books });
  },

  async getById(
    request: FastifyRequest<{ Params: BookParam }>,
    reply: FastifyReply,
  ) {
    const book = bookService.findById(request.params.id);
    if (!book) {
      getByIdLogger.warn({ id: request.params.id }, "book not found");
      return reply.code(404).send({ success: false, message: "Not found" });
    }
    getByIdLogger.info({ bookId: book.id }, "fetched book by id");
    return reply.send({ data: book });
  },

  async create(
    request: FastifyRequest<{ Body: BookBody }>,
    reply: FastifyReply,
  ) {
    const book = bookService.create(request.body);
    createLogger.info(
      { bookId: book.id, authorName: book.authorName },
      "book created",
    );
    return reply.code(201).send({ data: book });
  },

  async update(
    request: FastifyRequest<{ Params: BookParam; Body: BookBody }>,
    reply: FastifyReply,
  ) {
    const book = bookService.update(request.params.id, request.body);
    if (!book) {
      updateLogger.warn({ id: request.params.id }, "book not found for update");
      return reply.code(404).send({ success: false, message: "Not found" });
    }
    updateLogger.info({ bookId: book.id }, "book updated");
    return reply.send({ data: book });
  },

  async delete(
    request: FastifyRequest<{ Params: BookParam }>,
    reply: FastifyReply,
  ) {
    const deleted = bookService.delete(request.params.id);
    if (!deleted) {
      deleteLogger.warn({ id: request.params.id }, "book not found for delete");
      return reply.code(404).send({ success: false, message: "Not found" });
    }
    deleteLogger.info({ bookId: request.params.id }, "book deleted");
    return reply.code(204).send();
  },
};
