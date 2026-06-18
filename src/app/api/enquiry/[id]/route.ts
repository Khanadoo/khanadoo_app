import { updateStatus } from "@/modules/enquiry/enquiry.controller";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    return await updateStatus(req, id);
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
