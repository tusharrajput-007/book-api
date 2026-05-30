import { z } from "zod";

// Reusable query schema for any paginated endpoint
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

// Reusable function to calculate skip and take for Prisma
export const getPaginationParams = (page: number, limit: number) => {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

// Reusable function to build meta object
export const buildMeta = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
