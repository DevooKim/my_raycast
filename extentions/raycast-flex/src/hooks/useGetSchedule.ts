import { getPreferenceValues } from "@raycast/api";
import { type ScheduleData } from "../types/schedules";
import { useRef } from "react";
import { useCachedPromise } from "@raycast/utils";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { AuthError } from "../errors/AuthError";

type Preferences = {
  cookie: string;
  userId: string;
};

const SCHEDULE_CACHE_KEY = CACHE_KEY.SCHEDULE;

const getSchedule = async ({
  userId,
  cookie,
  timestamp,
}: {
  userId: string;
  cookie: string;
  timestamp: number;
}): Promise<ScheduleData> => {
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

  const fetchedData = (await response.json()) as ScheduleData;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    updatedAt: new Date(responseDate).getTime(),
  };
};

export default function useGetSchedule() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;
  const timestamp = Date.now();

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (cookie: string): Promise<ScheduleData> => {
      const cachedData = getCache<ScheduleData>(SCHEDULE_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      return await getSchedule({ userId, cookie, timestamp });
    },
    [preferences.cookie],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(SCHEDULE_CACHE_KEY)) {
          setCacheForNextMinute(SCHEDULE_CACHE_KEY, JSON.stringify(data));
        }
      },
      onError: () => {
        clearCache();
      },
    },
  );

  return result;
}
