import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./config/env";
import { loggerConfig } from "./plugins/logger";
import { errorHandler } from "./plugins/errorHandler";
import { bookRoutes } from "./routes/book.routes";

const app = Fastify({
  logger: loggerConfig,
}).withTypeProvider<ZodTypeProvider>();

// connecting fastify to zod. setting zod as validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// plugins
app.register(cors, { origin: "http://localhost:5173" });

// error handler
app.setErrorHandler(errorHandler);

// Health check route
app.get("/health", async (request, reply) => {
  return { status: "ok" };
});

// registering routes
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
