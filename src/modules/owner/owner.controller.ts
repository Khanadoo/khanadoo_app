import { authorize } from "@/middleware/role.middleware";

import { getOwnerDashboard } from "./owner.service";

export const dashboard = async (req: Request) => {
  const auth = await authorize(["OWNER", "ADMIN"])(req);

  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const data = await getOwnerDashboard(auth.user.id);

  return Response.json({
    success: true,
    ...data,
  });
};
