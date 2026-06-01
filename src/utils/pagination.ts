import { z } from "zod";

// Reusable query schema for any paginated endpoint
export const paginationSchema = z.object({
  page: z.coerce
    .number({ message: "Page must be a number" })
    .int()
    .min(1, "Page must be at least 1")
    .default(1),
  limit: z.coerce
    .number({ message: "Limit must be a number" })
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(10),
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
