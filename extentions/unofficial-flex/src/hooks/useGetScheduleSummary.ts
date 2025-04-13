import { getPreferenceValues } from "@raycast/api";
import { type ScheduleSummaryData } from "../types/scheduleSummary";
import { useRef } from "react";
import { useCachedPromise } from "@raycast/utils";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { getScheduleSummary } from "../fetches/getScheduleSummary";
import { getCookie } from "../utils/cookie";

const SUMMARY_CACHE_KEY = CACHE_KEY.SUMMARY;

export default function useGetScheduleSummary() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;
  const timestamp = Date.now();

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (): Promise<ScheduleSummaryData> => {
      const cookie = await getCookie();

      const cachedData = getCache<ScheduleSummaryData>(SUMMARY_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      return await getScheduleSummary({ userId, cookie, timestamp });
    },
    [],
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
