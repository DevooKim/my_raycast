import { AuthError } from "../errors/AuthError";
import { CurrentStatusResponse } from "../types/currentStatus";

export const getCurrentStatus = async ({
  userId,
  cookie,
}: {
  userId: string;
  cookie: string;
}): Promise<CurrentStatusResponse> => {
  const url = `https://flex.team/api/v2/time-tracking/work-clock/users/${userId}/current-status`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `AID=${cookie}`,
    },
  });

  if (response.status === 401) {
    throw new AuthError();
  }

  if (!response.ok) {
    console.error("Fetch error:", response.statusText);
    throw response;
  }

  const fetchedData = (await response.json()) as CurrentStatusResponse;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    requestedAt: new Date(responseDate).getTime(),
  };
};
