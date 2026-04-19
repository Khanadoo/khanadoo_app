import { registeredUser, loginUser, refreshUser } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { rateLimit } from "@/lib/rateLimiter";
import { generateCSRFToken } from "@/lib/csrf";
import { requireCSRF } from "@/middleware/csrf.middleware";

export const register = async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  await rateLimit(`login:${ip}`, {
    limit: 5,
    window: 60,
  });
  
  const body = await req.json();

  const parsed = registerSchema.parse(body);

  const user = await registeredUser(parsed);

  return Response.json(user);
};

export const login = async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  await rateLimit(`login:${ip}`, {
    limit: 5,
    window: 60,
  });

  const body = await req.json();

  const parsed = loginSchema.parse(body);

  const { accessToken, refreshToken } = await loginUser(parsed);

  const csrfToken = generateCSRFToken();

  (await cookies()).set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  (await cookies()).set("csrfToken", csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return Response.json({ accessToken });
};

export const refresh = async (req: Request) => {
  await requireCSRF(req);

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  await rateLimit(`login:${ip}`, {
    limit: 10,
    window: 60,
  });

  const cookieStore = cookies();
  const token = (await cookieStore).get("refreshToken")?.value;

  if (!token) {
    return Response.json(
      { error: "No refresh token provided" },
      { status: 401 },
    );
  }

  const { accessToken, refreshToken } = await refreshUser(token);

  (await cookieStore).set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return Response.json({ accessToken });
};

export const logout = async (req: Request) => {
  await requireCSRF(req);

  const cookieStore = cookies();
  const token = (await cookieStore).get("refreshToken")?.value;

  if (token) {
    const tokens = await prisma.refreshToken.findMany();

    let validToken = null;

    for (const t of tokens) {
      const isMatch = await bcrypt.compare(token, t.token);
      if (isMatch) {
        validToken = t;
        break;
      }
    }

    if (validToken) {
      await prisma.refreshToken.delete({
        where: { id: validToken.id },
      });
    }
  }

  (await cookieStore).delete("refreshToken");

  return Response.json({ message: "Logged out successfully" });
};
