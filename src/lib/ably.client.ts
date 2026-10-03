import * as Ably from "ably";

export const createAblyClient = (enquiryId: string, accessToken: string) => {
  return new Ably.Realtime({
    authUrl: `/api/ably/token?enquiryId=${encodeURIComponent(enquiryId)}`,
    authMethod: "GET",
    authHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
