import { FastifyRequest, FastifyReply } from "fastify";
import { issueService } from "../services/issue.service";
import { IssueBody, IssueParam, IssueQuery } from "../schemas/issue.schema";
import { createModuleLogger } from "../utils/logger";

const listLogger = createModuleLogger("issues/issue-list");
const createLogger = createModuleLogger("issues/issue-create");
const returnLogger = createModuleLogger("issues/issue-return");

export const issueController = {
  async getAll(
    request: FastifyRequest<{ Querystring: IssueQuery }>,
    reply: FastifyReply,
  ) {
    const result = await issueService.findAll(request.query);
    listLogger.info(
      { count: result.data.length, page: result.meta.page },
      "fetched all issues",
    );
    // return reply.ok(result);
    return reply.send({ success: true, ...result });
  },

  async create(
    request: FastifyRequest<{ Body: IssueBody }>,
    reply: FastifyReply,
  ) {
    const issue = await issueService.create(request.body);
    createLogger.info(
      { issueId: issue.id, bookId: issue.book.id, studentId: issue.student.id },
      "issue created",
    );
    return reply.ok(issue, 201);
  },

  async returnBook(
    request: FastifyRequest<{ Params: IssueParam }>,
    reply: FastifyReply,
  ) {
    const issue = await issueService.returnBook(request.params.id);
    returnLogger.info(
      { issueId: issue.id, bookId: issue.book.id },
      "book returned",
    );
    return reply.ok(issue);
  },
};
