import { getProperty } from "@/modules/enquiry/enquiry.controller";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      propertyId: string;
    }>;
  },
) {
  try {
    const { propertyId } = await params;

    return await getProperty(req, propertyId);
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
