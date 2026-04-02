import { register } from "@/modules/auth/auth.controller";

export async function POST(req: Request) {
    try{
        return await register(req);
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 400 });
    }
}