import { Cache, getPreferenceValues } from "@raycast/api";
import { type ScheduleData } from "../types/schedules";
import { useRef } from "react";
import { useCachedPromise } from "@raycast/utils";
import { tryCatch } from "../utils/try-catch";

type Preferences = {
  cookie: string;
  userId: string;
};

const SCHEDULE_KEY = "schedule";
const getExpiredKey = (key: string) => `${key}-expired`;
const cache = new Cache();

const isStaleCache = () => {
  const expiredKey = getExpiredKey(SCHEDULE_KEY);
  const expiredTime = cache.get(expiredKey);

  if (!expiredTime) return true;

  const now = new Date().getTime();

  return now > parseInt(expiredTime);
};

const getCache = <T = string>(key: string): T | null => {
  const stale = isStaleCache();
  const cachedData = cache.get(key);
  if (cachedData && !stale) {
    const { data } = tryCatch<T>(() => JSON.parse(cachedData));

    if (data) {
      return data;
    }

    return cachedData as T;
  }
  return null;
};

const setCacheForNextMinute = (key: string, value: string) => {
  const scheduleData = JSON.parse(value);

  // scheduleData.updatedAt의 그 다음 1분 00초
  const nextMinute = new Date(scheduleData.updatedAt);
  nextMinute.setMinutes(nextMinute.getMinutes() + 1);
  nextMinute.setSeconds(0);

  const expiredKey = getExpiredKey(key);

  cache.set(expiredKey, nextMinute.getTime().toString());
  cache.set(key, value);
};

export default function useGetSchedule() {
  const preferences = getPreferenceValues<Preferences>();
  const cookie = preferences.cookie;
  const userId = preferences.userId;
  const timestamp = Date.now();

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (url: string): Promise<ScheduleData> => {
      const cachedData = getCache<ScheduleData>(SCHEDULE_KEY);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(url, {
        signal: abortable.current?.signal,
        headers: {
          "Content-Type": "application/json",
          Cookie: `AID=${cookie}`,
        },
      });

      const fetchedData = await response.json();
      const responseDate = new Date(response.headers.get("date") || "");

      return {
        ...fetchedData,
        updatedAt: new Date(responseDate).getTime(),
      };
    },
    [
      `https://flex.team/api/v3/time-tracking/users/${userId}/work-schedules/summary/by-working-period?timestamp=${timestamp}&timezone=Asia%2FSeoul`, // Use userId in the URL
    ],
    {
      initialData: "Some Text",
      abortable,
      onData: (data) => {
        if (isStaleCache()) {
          setCacheForNextMinute(SCHEDULE_KEY, JSON.stringify(data));
        }
      },
    },
  );

  return result;
}
