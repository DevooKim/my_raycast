import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useRef } from "react";

import { type AttributesData } from "../types/attributes";

import { AuthError } from "../errors/AuthError";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextDay } from "../utils/cache";
import { seoulDayjs } from "../utils/dayjs.timezone";

const ATTRIBUTES_CACHE_KEY = CACHE_KEY.ATTRIBUTES;

const getAttributes = async ({ userId, cookie }: { userId: string; cookie: string }): Promise<AttributesData> => {
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
    console.log("401 error");
    throw new AuthError();
  }

  if (!response.ok) {
    console.error("Fetch error:", response.statusText);
    throw response;
  }

  const fetchedData = (await response.json()) as AttributesData;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    updatedAt: new Date(responseDate).getTime(),
  };
};

export default function useGetAttribute() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (cookie: string): Promise<AttributesData> => {
      const cachedData = getCache<AttributesData>(ATTRIBUTES_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      return await getAttributes({ userId, cookie });
    },
    [preferences.cookie],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(ATTRIBUTES_CACHE_KEY)) {
          setCacheForNextDay(ATTRIBUTES_CACHE_KEY, JSON.stringify(data), data.updatedAt);
        }
      },
      onError: () => {
        clearCache();
      },
    },
  );

  return result;
}
