import prisma from "../lib/prisma";
import { StudentBody, StudentQuery } from "../schemas/student.schema";
import { getPaginationParams, buildMeta } from "../utils/pagination";

export const studentService = {
  async findAll(query: StudentQuery) {
    const { page, limit, search } = query;
    const { skip, take } = getPaginationParams(page, limit);

    // search by name OR rollNo
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { rollNo: { contains: search } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: buildMeta(page, limit, total),
    };
  },

  async findById(id: number) {
    return prisma.student.findUnique({
      where: { id },
    });
  },

  async create(data: StudentBody, photoFile?: string) {
    return prisma.student.create({
      data: {
        ...data,
        photoFile: photoFile ?? null,
      },
    });
  },

  async update(id: number, data: StudentBody, photoFile?: string) {
    return prisma.student.update({
      where: { id },
      data: {
        ...data,
        // only update photoFile if a new file was provided, otherwise keep existing
        ...(photoFile !== undefined && { photoFile }),
      },
    });
  },

  async delete(id: number) {
    return prisma.student.delete({
      where: { id },
    });
  },
};
