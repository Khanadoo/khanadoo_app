import { authorize } from "@/middleware/role.middleware";

import { getOwnerProperties } from "./property.service";

export const getMyProperties = async (req: Request) => {
  const auth = await authorize(["OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const properties = await getOwnerProperties(auth.user.id);

  return Response.json({
    success: true,
    properties,
  });
};
