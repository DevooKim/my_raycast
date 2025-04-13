import { getPreferenceValues } from "@raycast/api";
import { type ScheduleSummaryData } from "../types/scheduleSummary";
import { useRef } from "react";
import { useCachedPromise } from "@raycast/utils";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { getScheduleSummary } from "../fetches/getScheduleSummary";

const SUMMARY_CACHE_KEY = CACHE_KEY.SUMMARY;

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
          setCacheForNextMinute({
            key: SUMMARY_CACHE_KEY,
            value: JSON.stringify(data),
            timestamp: data.requestedAt,
          });
        }
      },
      onError: () => {
        clearCache();
      },
    },
  );

  return result;
}
