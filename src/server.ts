import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./config/env";
import { loggerConfig } from "./plugins/logger";
import { errorHandler } from "./plugins/errorHandler";
import { authRoutes } from "./routes/auth.routes";
import { bookRoutes } from "./routes/book.routes";

const app = Fastify({
  logger: loggerConfig,
}).withTypeProvider<ZodTypeProvider>();

// connecting fastify to zod. setting zod as validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// plugins
app.register(cors, {
  origin: "http://localhost:5173",
  allowedHeaders: ["Authorization", "Content-Type"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  exposedHeaders: ["Content-Disposition"],
});

// register jwt plugin with secret
app.register(jwt, { secret: env.JWT_SECRET });

// error handler
app.setErrorHandler(errorHandler);

// Not found handler
app.setNotFoundHandler((request, reply) => {
  request.log.warn({ url: request.url }, "route not found");
  return reply.code(404).send({
    success: false,
    message: "Not found",
  });
});

// Health check route
app.get("/health", async (request, reply) => {
  return { status: "ok" };
});

// registering routes
app.register(authRoutes, { prefix: "/auth" });
app.register(bookRoutes, { prefix: "/books" });

// Start server
const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
