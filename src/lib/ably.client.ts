import * as Ably from "ably";

type RefreshSession = () => Promise<string | null>;

function createAuthCallback(
  authUrl: string,
  accessToken: string,
  refreshSession: RefreshSession,
) {
  let currentAccessToken = accessToken;

  return (
    _tokenParams: Ably.TokenParams,
    callback: (
      error: string | Ably.ErrorInfo | null,
      tokenRequestOrDetails:
        | string
        | Ably.TokenDetails
        | Ably.TokenRequest
        | null,
    ) => void,
  ) => {
    const requestToken = async () => {
      let response = await fetch(authUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentAccessToken}`,
        },
        credentials: "same-origin",
      });

      if (response.status === 401) {
        const refreshedToken = await refreshSession();

        if (!refreshedToken) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        currentAccessToken = refreshedToken;

        response = await fetch(authUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentAccessToken}`,
          },
          credentials: "same-origin",
        });
      }

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(body?.error || "Failed to authorize Ably connection.");
      }

      return response.json();
    };

    void requestToken()
      .then((tokenDetails) => callback(null, tokenDetails))
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to authorize Ably connection.";

        callback(message, null);
      });
  };
}

export const createAblyClient = (
  enquiryId: string,
  accessToken: string,
  refreshSession: RefreshSession,
) => {
  const authUrl = `/api/ably/token?enquiryId=${encodeURIComponent(enquiryId)}`;

  return new Ably.Realtime({
    authCallback: createAuthCallback(authUrl, accessToken, refreshSession),
  });
};

export const createNotificationAblyClient = (
  accessToken: string,
  refreshSession: RefreshSession,
) => {
  return new Ably.Realtime({
    authCallback: createAuthCallback(
      "/api/ably/token?notifications=true",
      accessToken,
      refreshSession,
    ),
  });
};
