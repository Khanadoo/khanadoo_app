import { registeredUser, loginUser, refreshUser } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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
        return Response.json({ error: "No refresh token provided" }, { status: 401 });
    }

    const { accesstoken: accessToken, refreshToken } = await refreshUser(token);

    (await cookieStore).set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
    });

    return Response.json({ accessToken });
};

export const logout = async() => {
    const cookieStore = cookies();
    const token = (await cookieStore).get("refreshToken")?.value;

    if (token) {
        const user = await prisma.user.findFirst({
            where: { refreshToken: token },
        });

        if (user){
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken: null },
            });
        }
    }

    (await cookieStore).delete("refreshToken");

    return Response.json({ message: "Logged out successfully" });
};