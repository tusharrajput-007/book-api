import { env } from "../config/env";
import { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "../services/auth.service";
import { RegisterBody, LoginBody } from "../schemas/auth.schema";
import { createModuleLogger } from "../utils/logger";

const registerLogger = createModuleLogger("auth/auth-register");
const loginLogger = createModuleLogger("auth/auth-login");
const meLogger = createModuleLogger("auth/auth-me");

export const authController = {
  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
  ) {
    const user = await authService.register(request.body);
    registerLogger.info(
      { userId: user.id, email: user.email },
      "user registered",
    );
    return reply.code(201).send({ data: user });
  },

  async login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
  ) {
    const user = await authService.login(request.body);
    if (!user) {
      loginLogger.warn({ email: request.body.email }, "invalid credentials");
      return reply.code(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Sign JWT token
    const token = await request.server.jwt.sign(
      { sub: user.id },
      { expiresIn: "7d" },
    );

    loginLogger.info({ userId: user.id }, "user logged in");
    return reply.send({
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
        },
      },
    });
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    const user = await authService.findById(request.user.sub);
    if (!user) {
      meLogger.warn({ userId: request.user.sub }, "user not found");
      return reply.code(404).send({ success: false, message: "Not found" });
    }
    meLogger.info({ userId: user.id }, "fetched current user");
    return reply.send({ data: user });
  },

  async googleCallback(request: FastifyRequest, reply: FastifyReply) {
    try {
      // exchange code for token
      const { token } = await (
        request.server as any
      ).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

      // fetch user info from Google
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${token.access_token}` },
        },
      );
      const userInfo = (await userInfoResponse.json()) as any;

      // find or create user
      const user = await authService.findOrCreateGoogleUser(
        userInfo.sub,
        userInfo.email,
        userInfo.given_name,
        userInfo.family_name ?? "",
      );

      // sign JWT
      const jwtToken = await request.server.jwt.sign(
        { sub: user.id },
        { expiresIn: "7d" },
      );

      // redirect to frontend with token
      return reply.redirect(
        `${env.FRONTEND_URL}/auth/callback?token=${jwtToken}`,
      );
    } catch (err) {
      return reply.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  },
};
