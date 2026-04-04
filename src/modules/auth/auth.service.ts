import bcrypt from 'bcrypt';
import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from './auth.utils';
import jwt from 'jsonwebtoken';

export const registeredUser = async (data: any)=>{
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data:{
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role || "STUDENT",
        },
    });

    return user;
}

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

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedToken },
    });
    
    return { accessToken, refreshToken };
};

export const refreshUser = async (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        })

        if (!user || user.refreshToken !== token) {
            throw new Error("Invalid refresh token");
        }

        const isValid = await bcrypt.compare(token, user.refreshToken);

        if(!isValid) {
            throw new Error("Invalid token");
        }

        const newAccessToken = generateAccessToken({ id: user.id, role: user.role, });

        const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role, });

        return { accesstoken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
        throw new Error("Token expired or Invalid");
    }
}