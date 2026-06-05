import { Role } from "@prisma/client";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

export const authorize = (roles: Role[]) => {
    return async (req: Request) => {
        const user = await getUserFromRequest(req);

        if (!user){
            return { error: "Unauthorized", status: 401 };
        }

        if (!roles.includes(user.role)) {
            return { error: "Forbidden", status: 403 };
        }

        return { user };
    };
};