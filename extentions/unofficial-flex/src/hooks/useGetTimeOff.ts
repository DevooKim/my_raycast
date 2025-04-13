import { getPreferenceValues } from "@raycast/api";
import { useRef } from "react";
import { useCachedPromise } from "@raycast/utils";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { CustomTimeOffForm, TimeOffUse, UserTimeOffRegisterEventBlock } from "../types/timeOff";
import { getTimeOff } from "../fetches/getTimeOff";

const TIME_OFF_CACHE_KEY = CACHE_KEY.TIME_OFF;

export type TimeOffListItem = UserTimeOffRegisterEventBlock & {
  timeOffPolicyId: TimeOffUse["timeOffPolicyId"];
  // blockDate: string;
};

const getTimeOffList = (timeOffUses: TimeOffUse[]): TimeOffListItem[] => {
  return timeOffUses
    .map((item) =>
      item.userTimeOffRegisterEventBlocks.map((block) => ({
        ...block,
        timeOffPolicyId: item.timeOffPolicyId,
      })),
    )
    .flat();
};

const getTimeOffPolicyMap = (customTimeOffForms: CustomTimeOffForm[]) => {
  return customTimeOffForms.reduce(
    (acc, form) => {
      acc[form.timeOffPolicyId] = form.displayInfo;
      return acc;
    },
    {} as Record<string, CustomTimeOffForm["displayInfo"]>,
  );
};

export default function useGetTimeOff() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (
      cookie: string,
    ): Promise<{
      timeOffList: (UserTimeOffRegisterEventBlock & { timeOffPolicyId: TimeOffUse["timeOffPolicyId"] })[];
      timeOffPolicyMap: Record<string, CustomTimeOffForm["displayInfo"]>;
      requestedAt: number;
    }> => {
      const cachedData = getCache<{
        timeOffList: (UserTimeOffRegisterEventBlock & { timeOffPolicyId: TimeOffUse["timeOffPolicyId"] })[];
        timeOffPolicyMap: Record<string, CustomTimeOffForm["displayInfo"]>;
        requestedAt: number;
      }>(TIME_OFF_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      const response = await getTimeOff({ userId, cookie });

      const timeOffList = getTimeOffList(response.timeOffUses);
      const timeOffPolicyMap = getTimeOffPolicyMap(response.customTimeOffForms);

      return {
        timeOffList,
        timeOffPolicyMap,
        requestedAt: response.requestedAt,
      };
    },
    [preferences.cookie],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(TIME_OFF_CACHE_KEY)) {
          setCacheForNextMinute({
            key: TIME_OFF_CACHE_KEY,
            value: JSON.stringify(data),
            validMinutes: data.requestedAt,
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
