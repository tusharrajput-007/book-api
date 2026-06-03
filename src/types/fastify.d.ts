import "@fastify/jwt";
import { FastifyReply } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: number };
    user: { sub: number };
  }
}

declare module "fastify" {
  interface FastifyReply {
    ok(data: unknown, code?: number): FastifyReply;
  }
}
