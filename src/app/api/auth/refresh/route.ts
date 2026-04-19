import { refresh } from "@/modules/auth/auth.controller";

export async function POST(req: Request) {
  try {
    return await refresh(req);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
