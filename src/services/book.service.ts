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

  async findAllForExport(search?: string) {
    const where = search ? { bookName: { contains: search } } : {};

    return prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: BookBody, coverFile?: string) {
    return prisma.book.create({
      data: {
        ...data,
        coverFile: coverFile ?? null,
      },
    });
  },

  async update(id: number, data: BookBody, coverFile?: string) {
    return prisma.book.update({
      where: { id },
      data: {
        ...data,
        // only update coverFile if a new file was provided, otherwise keep existing
        ...(coverFile !== undefined && { coverFile }),
      },
    });
  },

  async delete(id: number) {
    return prisma.book.delete({
      where: { id },
    });
  },
};
