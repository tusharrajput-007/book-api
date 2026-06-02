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
import { studentRoutes } from "./routes/student.routes";
import { issueRoutes } from "./routes/issue.routes";
import multipart from "@fastify/multipart";
import oauth2 from "@fastify/oauth2";

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

// register google oauth2 plugin
app.register(oauth2, {
  name: "googleOAuth2",
  scope: ["profile", "email"],
  credentials: {
    client: {
      id: env.GOOGLE_CLIENT_ID,
      secret: env.GOOGLE_CLIENT_SECRET,
    },
    auth: {
      authorizeHost: "https://accounts.google.com",
      authorizePath: "/o/oauth2/auth",
      tokenHost: "https://oauth2.googleapis.com",
      tokenPath: "/token",
    },
  },
  startRedirectPath: "/auth/google",
  callbackUri: env.GOOGLE_CALLBACK_URL,
});

// register multipart for file uploads
app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

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
app.register(studentRoutes, { prefix: "/students" });
app.register(issueRoutes, { prefix: "/issues" });

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
