import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useRef } from "react";

import { DateAttributes, type DateAttributesResponse } from "../types/dateAttributes";

import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextHour } from "../utils/cache";
import { getDateAttributes } from "../fetches/getDateAttribute";
import { getCookie } from "../utils/cookie";

const ATTRIBUTES_CACHE_KEY = CACHE_KEY.ATTRIBUTES;

const parseDateAttributes = (data: DateAttributesResponse) => {
  const totalDaysOfMonth = data.workingDayAttributes.length;
  const dayOffCountOfMonth = data.workingDayAttributes.filter((day) => day.dayOffs.length).length;

  return { totalDaysOfMonth, dayOffCountOfMonth };
};

export default function useGetDateAttribute() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (): Promise<DateAttributes> => {
      const cookie = await getCookie();

      const cachedData = getCache<DateAttributes>(ATTRIBUTES_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      const response = await getDateAttributes({ userId, cookie });

      const parsedDateAttributes = parseDateAttributes(response);

      return {
        ...parsedDateAttributes,
        requestedAt: response.requestedAt,
      };
    },
    [],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(ATTRIBUTES_CACHE_KEY)) {
          setCacheForNextHour({
            key: ATTRIBUTES_CACHE_KEY,
            value: JSON.stringify(data),
            validHours: 3,
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
