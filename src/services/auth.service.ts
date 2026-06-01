import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { RegisterBody, LoginBody } from "../schemas/auth.schema";

export const authService = {
  async register(data: RegisterBody) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        passwordHash,
      },
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };
  },

  async login(data: LoginBody) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) return null;

    // Compare password with stored hash
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) return null;

    return user;
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
      },
    });
  },
};
