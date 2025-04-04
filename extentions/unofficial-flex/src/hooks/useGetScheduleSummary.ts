import { getPreferenceValues } from "@raycast/api";
import { type ScheduleSummaryData } from "../types/scheduleSummary";
import { useRef } from "react";
import { useCachedPromise } from "@raycast/utils";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { AuthError } from "../errors/AuthError";

const SUMMARY_CACHE_KEY = CACHE_KEY.SUMMARY;

const getScheduleSummary = async ({
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

export default function useGetScheduleSummary() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;
  const timestamp = Date.now();

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (cookie: string): Promise<ScheduleSummaryData> => {
      const cachedData = getCache<ScheduleSummaryData>(SUMMARY_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      return await getScheduleSummary({ userId, cookie, timestamp });
    },
    [preferences.cookie],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(SUMMARY_CACHE_KEY)) {
          setCacheForNextMinute(SUMMARY_CACHE_KEY, JSON.stringify(data), data.requestedAt);
        }
      },
      onError: () => {
        clearCache();
      },
    },
  );

  return result;
}
