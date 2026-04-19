import { verifyToken } from "./auth.middleware";

export const authorize = (roles: string[]) => {
    return (req: Request) => {
        const user = verifyToken(req);

        if (!roles.includes(user.role)){
            throw new Error("Forbidden");
        }

        return user;
    };
};