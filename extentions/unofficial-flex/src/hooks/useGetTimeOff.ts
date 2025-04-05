import { getPreferenceValues } from "@raycast/api";
import { useRef } from "react";
import { useCachedPromise } from "@raycast/utils";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { AuthError } from "../errors/AuthError";
import { UserTimeOffRegisterEventBlock, type TimeOffData } from "../types/timeOff";
import { seoulDayjs } from "../utils/dayjs.timezone";

const TIME_OFF_CACHE_KEY = CACHE_KEY.TIME_OFF;

const getTimeOff = async ({ userId, cookie }: { userId: string; cookie: string }): Promise<TimeOffData> => {
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

export default function useGetTimeOff() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (cookie: string): Promise<{ timeOffList: UserTimeOffRegisterEventBlock[]; requestedAt: number }> => {
      const cachedData = getCache<{ timeOffList: UserTimeOffRegisterEventBlock[]; requestedAt: number }>(
        TIME_OFF_CACHE_KEY,
      );
      if (cachedData) {
        return cachedData;
      }

      const response = await getTimeOff({ userId, cookie });

      const timeOffList = response.timeOffUses.map((item) => item.userTimeOffRegisterEventBlocks).flat();

      return {
        timeOffList,
        requestedAt: response.requestedAt,
      };
    },
    [preferences.cookie],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(TIME_OFF_CACHE_KEY)) {
          setCacheForNextMinute(TIME_OFF_CACHE_KEY, JSON.stringify(data), data.requestedAt);
        }
      },
      onError: () => {
        clearCache();
      },
    },
  );

  return result;
}
