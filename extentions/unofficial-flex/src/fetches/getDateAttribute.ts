import { AuthError } from "../errors/AuthError";
import { DateAttributesResponse } from "../types/dateAttributes";
import { seoulDayjs } from "../utils/dayjs.timezone";

export const getDateAttributes = async ({
  userId,
  cookie,
}: {
  userId: string;
  cookie: string;
}): Promise<{ requestedAt: number } & DateAttributesResponse> => {
  const from = seoulDayjs().startOf("month").format("YYYY-MM-DD");
  const to = seoulDayjs().endOf("month").format("YYYY-MM-DD");

  const url = `https://flex.team/api/v3/time-tracking/users/${userId}/work-schedules/date-attributes?from=${from}&to=${to}&timezone=Asia/Seoul`;

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

  const fetchedData = (await response.json()) as DateAttributesResponse;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    requestedAt: new Date(responseDate).getTime(),
  };
};
