import { FastifyRequest, FastifyReply } from "fastify";
import { bookService } from "../services/book.service";
import { bookBodySchema, BookParam, BookQuery } from "../schemas/book.schema";
import { createModuleLogger } from "../utils/logger";
import { saveFile, deleteFile } from "../utils/fileUpload";

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
    // return reply.ok(result);
    return reply.send({ success: true, ...result });
  },

  async getById(
    request: FastifyRequest<{ Params: BookParam }>,
    reply: FastifyReply,
  ) {
    const book = await bookService.findById(request.params.id);
    if (!book) {
      getByIdLogger.warn({ id: request.params.id }, "book not found");
      return reply.code(404).send({
        success: false,
        message: "Not found",
        error: { code: "NOT_FOUND", message: "Not found" },
      });
    }
    getByIdLogger.info({ bookId: book.id }, "fetched book by id");
    return reply.ok(book);
  },

  // getCover
  async getCover(
    request: FastifyRequest<{ Params: BookParam }>,
    reply: FastifyReply,
  ) {
    const book = await bookService.findById(request.params.id);
    if (!book) {
      return reply.code(404).send({
        success: false,
        message: "Not found",
        error: { code: "NOT_FOUND", message: "Not found" },
      });
    }
    if (!book.coverFile) {
      return reply.code(404).send({
        success: false,
        message: "This book has no cover",
        error: { code: "NOT_FOUND", message: "This book has no cover" },
      });
    }

    const { createReadStream } = await import("fs");
    const { extname } = await import("path");

    const ext = extname(book.coverFile);
    const filename = `${book.bookName}${ext}`;

    reply.header("Content-Disposition", `inline; filename="${filename}"`);
    reply.header("Content-Type", ext === ".png" ? "image/png" : "image/jpeg");

    return reply.send(createReadStream(book.coverFile));
  },

  // exportXlsx
  async exportXlsx(
    request: FastifyRequest<{ Querystring: { search?: string } }>,
    reply: FastifyReply,
  ) {
    const { search } = request.query;
    const books = await bookService.findAllForExport(search);

    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.default.Workbook();
    const sheet = workbook.addWorksheet("Books");

    sheet.columns = [
      { header: "Id", key: "id", width: 10 },
      { header: "Book Name", key: "bookName", width: 30 },
      { header: "Author Name", key: "authorName", width: 30 },
      { header: "ISBN", key: "isbn", width: 20 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    sheet.addRows(
      books.map((book: any) => ({
        id: book.id,
        bookName: book.bookName,
        authorName: book.authorName,
        isbn: book.isbn,
        createdAt: book.createdAt.toISOString(),
      })),
    );

    reply.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    reply.header("Content-Disposition", 'attachment; filename="books.xlsx"');

    const buffer = await workbook.xlsx.writeBuffer();
    return reply.send(buffer);
  },

  // exportCsv
  async exportCsv(
    request: FastifyRequest<{ Querystring: { search?: string } }>,
    reply: FastifyReply,
  ) {
    const { search } = request.query;
    const books = await bookService.findAllForExport(search);

    const { Stringifier } = await import("csv-stringify");
    const { PassThrough } = await import("stream");

    reply.header("Content-Type", "text/csv; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="books.csv"');

    const pass = new PassThrough();
    const stringifier = new Stringifier({
      header: true,
      columns: ["Id", "Book Name", "Author Name", "ISBN", "Created At"],
    });

    stringifier.pipe(pass);

    books.forEach((book: any) => {
      stringifier.write({
        Id: book.id,
        "Book Name": book.bookName,
        "Author Name": book.authorName,
        ISBN: book.isbn,
        "Created At": book.createdAt.toISOString(),
      });
    });

    stringifier.end();

    return reply.send(pass);
  },

  // exportPdf
  async exportPdf(
    request: FastifyRequest<{ Params: BookParam }>,
    reply: FastifyReply,
  ) {
    const book = await bookService.findById(request.params.id);
    if (!book) {
      return reply.code(404).send({
        success: false,
        message: "Not found",
        error: { code: "NOT_FOUND", message: "Not found" },
      });
    }

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    reply.header("Content-Type", "application/pdf");
    reply.header(
      "Content-Disposition",
      `attachment; filename="book-${book.id}.pdf"`,
    );

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);

      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("BOOK DETAILS", { align: "center" })
        .moveDown();

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown();

      if (book.coverFile) {
        const pageWidth = 595;
        const imgWidth = 200;
        const imgX = (pageWidth - imgWidth) / 2;
        doc.image(book.coverFile, imgX, doc.y, { width: 200, height: 300 });
        doc.moveDown(18);
      }

      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown();

      doc.fontSize(12).font("Helvetica");

      doc.font("Helvetica-Bold").text("Book Name: ", { continued: true });
      doc.font("Helvetica").text(book.bookName).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Author: ", { continued: true });
      doc.font("Helvetica").text(book.authorName).moveDown(0.5);

      doc.font("Helvetica-Bold").text("ISBN: ", { continued: true });
      doc.font("Helvetica").text(book.isbn).moveDown(0.5);

      doc.font("Helvetica-Bold").text("Created At: ", { continued: true });
      doc.font("Helvetica").text(book.createdAt.toISOString().split("T")[0]);

      doc.end();
    });

    const buffer = Buffer.concat(chunks);
    return reply.send(buffer);
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const fields: Record<string, string> = {};
    let coverFile: string | undefined;

    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (part.fieldname === "coverImage" && part.filename) {
          coverFile = await saveFile(part, "books");
        } else {
          await part.toBuffer();
        }
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    // validate fields using Zod schema
    const parsed = bookBodySchema.safeParse(fields);
    if (!parsed.success) throw parsed.error;

    const book = await bookService.create(parsed.data, coverFile);

    createLogger.info(
      { bookId: book.id, authorName: book.authorName },
      "book created",
    );
    return reply.ok(book, 201);
  },

  async update(
    request: FastifyRequest<{ Params: BookParam }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;

    const existing = await bookService.findById(id);
    if (!existing) {
      updateLogger.warn({ id }, "book not found for update");
      return reply.code(404).send({
        success: false,
        message: "Not found",
        error: { code: "NOT_FOUND", message: "Not found" },
      });
    }

    const fields: Record<string, string> = {};
    let coverFile: string | undefined;

    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (part.fieldname === "coverImage" && part.filename) {
          if (existing.coverFile) await deleteFile(existing.coverFile);
          coverFile = await saveFile(part, "books");
        } else {
          await part.toBuffer();
        }
      } else {
        fields[part.fieldname] = part.value as string;
      }
    }

    // validate fields using Zod schema
    const parsed = bookBodySchema.safeParse(fields);
    if (!parsed.success) throw parsed.error;

    const book = await bookService.update(id, parsed.data, coverFile);

    updateLogger.info({ bookId: book.id }, "book updated");
    return reply.ok(book);
  },

  async delete(
    request: FastifyRequest<{ Params: BookParam }>,
    reply: FastifyReply,
  ) {
    const book = await bookService.findById(request.params.id);
    if (book?.coverFile) await deleteFile(book.coverFile);

    await bookService.delete(request.params.id);
    deleteLogger.info({ bookId: request.params.id }, "book deleted");
    return reply.code(204).send();
  },
};
