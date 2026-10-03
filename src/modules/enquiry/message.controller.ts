import { authorize } from "@/middleware/role.middleware";
import { createMessageSchema } from "./message.schema";
import { createMessage, getMessages } from "./message.service";
import { publishMessageCreated } from "@/lib/ably.server";

export const get = async (req: Request, enquiryId: string) => {
  const auth = await authorize(["USER", "OWNER"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const messages = await getMessages(enquiryId, auth.user.id);

  return Response.json({
    success: true,
    messages,
  });
};

export const create = async (req: Request, enquiryId: string) => {
  const auth = await authorize(["USER", "OWNER"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();

  const parsed = createMessageSchema.parse(body);

  const message = await createMessage(enquiryId, auth.user.id, parsed);

  try {
    await publishMessageCreated(enquiryId, message);
  } catch (error) {
    console.error("Ably message publish error:", error);
  }

  return Response.json(
    {
      success: true,
      message,
    },
    { status: 201 },
  );
};
