import { getPreferenceValues } from "@raycast/api";
import { type SummaryData } from "../types/summary";
import { useRef } from "react";
import { useCachedPromise } from "@raycast/utils";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { AuthError } from "../errors/AuthError";

const SUMMARY_CACHE_KEY = CACHE_KEY.SUMMARY;

const getSummary = async ({
  userId,
  cookie,
  timestamp,
}: {
  userId: string;
  cookie: string;
  timestamp: number;
}): Promise<SummaryData> => {
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

  const fetchedData = (await response.json()) as SummaryData;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    updatedAt: new Date(responseDate).getTime(),
  };
};

export default function useGetSummary() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;
  const timestamp = Date.now();

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (cookie: string): Promise<SummaryData> => {
      const cachedData = getCache<SummaryData>(SUMMARY_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      return await getSummary({ userId, cookie, timestamp });
    },
    [preferences.cookie],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(SUMMARY_CACHE_KEY)) {
          setCacheForNextMinute(SUMMARY_CACHE_KEY, JSON.stringify(data), data.updatedAt);
        }
      },
      onError: () => {
        clearCache();
      },
    },
  );

  return result;
}
