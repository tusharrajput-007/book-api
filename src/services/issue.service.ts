import prisma from "../lib/prisma";
import { IssueBody, IssueQuery } from "../schemas/issue.schema";
import { getPaginationParams, buildMeta } from "../utils/pagination";

// reusable include object for joining book and student
const issueInclude = {
  book: {
    select: { id: true, bookName: true, isbn: true },
  },
  student: {
    select: { id: true, name: true, rollNo: true },
  },
};

export const issueService = {
  async findAll(query: IssueQuery) {
    const { page, limit, status } = query;
    const { skip, take } = getPaginationParams(page, limit);

    const where = status ? { status } : {};

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: issueInclude,
      }),
      prisma.issue.count({ where }),
    ]);

    return {
      data: issues,
      meta: buildMeta(page, limit, total),
    };
  },

  async create(data: IssueBody) {
    // if book exists
    const book = await prisma.book.findUnique({ where: { id: data.bookId } });
    if (!book) throw { statusCode: 404, message: "Book not found" };

    // if student exists
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
    });
    if (!student) throw { statusCode: 404, message: "Student not found" };

    // if book is already issued
    const existingIssue = await prisma.issue.findFirst({
      where: { bookId: data.bookId, status: "ISSUED" },
    });
    if (existingIssue)
      throw { statusCode: 409, message: "Book is already issued" };

    return prisma.issue.create({
      data: {
        bookId: data.bookId,
        studentId: data.studentId,
        issueDate: new Date(data.issueDate),
      },
      include: issueInclude,
    });
  },

  async returnBook(id: number) {
    // if issue exists
    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) throw { statusCode: 404, message: "Issue not found" };

    // if already returned
    if (issue.status === "RETURNED")
      throw { statusCode: 409, message: "Book already returned" };

    return prisma.issue.update({
      where: { id },
      data: {
        returnDate: new Date(),
        status: "RETURNED",
      },
      include: issueInclude,
    });
  },
};
