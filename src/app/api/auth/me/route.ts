import { me } from "@/modules/auth/auth.controller";

export async function GET(req: Request) {
  try {
    return await me(req);
  } catch (err: any) {
    return Response.json(
      {
        error: err.message,
      },
      {
        status: 400,
      },
    );
  }
}
