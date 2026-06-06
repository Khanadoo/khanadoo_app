import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().transform((v) => v.toLowerCase()),
    password: z.string().min(6),
    phone: z.string().regex(/^[0-9]{10,15}$/, "Invalid phone number"),
});

export const loginSchema = z.object({
    email: z.string().email().transform((v) => v.toLowerCase()),
    password: z.string(),
});