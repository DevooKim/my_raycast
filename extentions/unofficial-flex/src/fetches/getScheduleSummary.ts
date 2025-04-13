import { AuthError } from "../errors/AuthError";
import { ScheduleSummaryData } from "../types/scheduleSummary";

export const getScheduleSummary = async ({
  userId,
  cookie,
  timestamp,
}: {
  userId: string;
  cookie: string;
  timestamp: number;
}): Promise<ScheduleSummaryData> => {
  const url = `https://flex.team/api/v3/time-tracking/users/${userId}/work-schedules/summary/by-working-period?timestamp=${timestamp}&timezone=Asia%2FSeoul`;

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
    throw response;
  }

  const fetchedData = (await response.json()) as ScheduleSummaryData;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    requestedAt: new Date(responseDate).getTime(),
  };
};
