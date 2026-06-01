import { FastifyRequest, FastifyReply } from "fastify";
import { bookService } from "../services/book.service";
import { BookBody, BookParam, BookQuery } from "../schemas/book.schema";
import { createModuleLogger } from "../utils/logger";

const listLogger = createModuleLogger("books/book-list");
const getByIdLogger = createModuleLogger("books/book-getbyid");
const createLogger = createModuleLogger("books/book-create");
const updateLogger = createModuleLogger("books/book-update");
const deleteLogger = createModuleLogger("books/book-delete");

export const bookController = {
  async getAll(
    request: FastifyRequest<{ Querystring: BookQuery }>,
    reply: FastifyReply,
  ) {
    const result = await bookService.findAll(request.query);
    listLogger.info(
      { count: result.data.length, page: result.meta.page },
      "fetched all books",
    );
    return reply.send(result);
  },

  async getById(
    request: FastifyRequest<{ Params: BookParam }>,
    reply: FastifyReply,
  ) {
    const book = await bookService.findById(request.params.id);
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
    const book = await bookService.create(request.body);
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
    const book = await bookService.update(request.params.id, request.body);
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
    await bookService.delete(request.params.id);
    deleteLogger.info({ bookId: request.params.id }, "book deleted");
    return reply.code(204).send();
  },
};
