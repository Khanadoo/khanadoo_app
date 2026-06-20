import { dashboard } from "@/modules/owner/owner.controller";

export async function GET(req: Request) {
  try {
    return await dashboard(req);
  } catch (err: any) {
    return Response.json(
      {
        error: err.message || "Failed to load dashboard",
      },
      {
        status: 500,
      },
    );
  }
}
