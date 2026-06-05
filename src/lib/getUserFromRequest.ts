import { prisma } from "./prisma";
import { verifyToken } from "@/middleware/auth.middleware";

export async function getUserFromRequest(req: Request){
    try {
        const decoded = verifyToken(req);

        if (!decoded?.id) return null;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        return user;
    } catch (err) {
        return null;
    }
}