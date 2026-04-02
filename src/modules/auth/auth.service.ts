import bcrypt from 'bcrypt';
import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from './auth.utils';

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
    
    return { accessToken, refreshToken };
};