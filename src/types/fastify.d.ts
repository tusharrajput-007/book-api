import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: number };
    user: { sub: number };
  }
}
