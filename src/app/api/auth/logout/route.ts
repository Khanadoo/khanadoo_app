import { logout } from "@/modules/auth/auth.controller";

export async function POST(req: Request) {
    try {
        return await logout(req);
    } catch (err: any) {
        return Response.json({ error: err.message || "An error occurred during logout" }, { status: 500 });
    }
}