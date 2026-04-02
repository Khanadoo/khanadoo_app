export const requireRole = (role: string, user: any) => {
    if(user.role !== role) {
        throw new Error("Unauthorized");
    }
};