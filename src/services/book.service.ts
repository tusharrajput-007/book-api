import prisma from "../lib/prisma";
import { BookBody, BookQuery } from "../schemas/book.schema";
import { getPaginationParams, buildMeta } from "../utils/pagination";

export const bookService = {
  async findAll(query: BookQuery) {
    const { page, limit, search } = query;
    const { skip, take } = getPaginationParams(page, limit);

    // where clause for search
    const where = search
      ? {
          bookName: {
            contains: search,
          },
        }
      : {};

    // both queries simultaneously
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      data: books,
      meta: buildMeta(page, limit, total),
    };
  },

  async findById(id: number) {
    return prisma.book.findUnique({
      where: { id },
    });
  },

  async create(data: BookBody) {
    return prisma.book.create({
      data,
    });
  },

  async update(id: number, data: BookBody) {
    return prisma.book.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.book.delete({
      where: { id },
    });
  },
};
