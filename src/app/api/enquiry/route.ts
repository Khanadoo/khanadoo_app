import { create, getMine } from "@/modules/enquiry/enquiry.controller";

export async function POST(req: Request) {
  try {
    return await create(req);
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

export async function GET(req: Request) {
  try {
    return await getMine(req);
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
