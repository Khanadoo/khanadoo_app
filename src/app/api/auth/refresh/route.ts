import { refresh } from "@/modules/auth/auth.controller";

export async function POST() {
  try {
    return await refresh();
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}
