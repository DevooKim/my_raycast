import { AuthError } from "../errors/AuthError";
import { TimeOffData } from "../types/timeOff";
import { seoulDayjs } from "../utils/dayjs.timezone";

export const getTimeOff = async ({ userId, cookie }: { userId: string; cookie: string }): Promise<TimeOffData> => {
  const from = seoulDayjs().startOf("month").valueOf();
  const to = seoulDayjs().endOf("month").valueOf();

  const url = `https://flex.team/api/v2/time-off/users/${userId}/time-off-uses/by-use-date-range/${from}..${to}?eventTypes=REGISTER`;

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

  const fetchedData = (await response.json()) as TimeOffData;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    requestedAt: new Date(responseDate).getTime(),
  };
};
