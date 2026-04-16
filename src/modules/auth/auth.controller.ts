import { registeredUser, loginUser, refreshUser } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const register = async (req: Request) => {
  const body = await req.json();

  const parsed = registerSchema.parse(body);

  const user = await registeredUser(parsed);

  return Response.json(user);
};

export const login = async (req: Request) => {
  const body = await req.json();

  const parsed = loginSchema.parse(body);

  const { accessToken, refreshToken } = await loginUser(parsed);

  (await cookies()).set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return Response.json({ accessToken });
};

export const refresh = async () => {
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
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return Response.json({ accessToken });
};

export const logout = async () => {
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
