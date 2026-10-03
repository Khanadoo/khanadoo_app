import * as Ably from "ably";

let ably: Ably.Rest | null = null;

export const getAblyServer = () => {
  if (!process.env.ABLY_API_KEY) {
    throw new Error("ABLY_API_KEY is not configured");
  }

  if (!ably) {
    ably = new Ably.Rest(process.env.ABLY_API_KEY);
  }

  return ably;
};
