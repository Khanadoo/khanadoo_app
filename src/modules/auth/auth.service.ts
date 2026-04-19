import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "./auth.utils";
import jwt from "jsonwebtoken";

const MAX_SESSIONS = 5;

export const registeredUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "STUDENT",
    },
  });

  return user;
};

export const loginUser = async (data: any) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) throw new Error("invalid credentials");

  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) throw new Error("invalid credentials");

  const payload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const hashedToken = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id, expiresAt: { lt: new Date() } },
  });

  const existingSessions = await prisma.refreshToken.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  if (existingSessions.length >= MAX_SESSIONS) {
    const oldeestSession = existingSessions[0];

    await prisma.refreshToken.delete({
      where: { id: oldeestSession.id },
    });
  }

  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
};

export const refreshUser = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;

    const tokens = await prisma.refreshToken.findMany({
      where: { userId: decoded.id },
    });

    let validToken = null;

    for (const t of tokens) {
      if (t.expiresAt < new Date()) continue;

      const isMatch = await bcrypt.compare(token, t.token);
      if (isMatch) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      throw new Error("Invalid token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) throw new Error("User not found");

    const newAccessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
    });
    
    await prisma.refreshToken.delete({
      where: { id: validToken.id },
    });

    await prisma.refreshToken.create({
      data: {
        token: await bcrypt.hash(newRefreshToken, 10),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    throw new Error("Token expired or invalid");
  }
};
