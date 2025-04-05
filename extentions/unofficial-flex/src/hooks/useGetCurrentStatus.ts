import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useRef } from "react";

import type { RealtimeStatus, CurrentStatusData } from "../types/currentStatus";
import { WorkForm } from "../types/workForm";

import { AuthError } from "../errors/AuthError";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";

const STATUS_CACHE_KEY = CACHE_KEY.STATUS;

const getCurrentStatus = async ({ userId, cookie }: { userId: string; cookie: string }): Promise<CurrentStatusData> => {
  const url = `https://flex.team/api/v2/time-tracking/work-clock/users/${userId}/current-status`;

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

  const fetchedData = (await response.json()) as CurrentStatusData;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    requestedAt: new Date(responseDate).getTime(),
  };
};

const determineCurrentState = (response: CurrentStatusData): RealtimeStatus => {
  if (response?.onGoingRecordPack?.onGoing === true) {
    // 현재 근무 중인 경우
    return WorkForm[response?.onGoingRecordPack?.startRecord?.customerWorkFormId] || "알 수 없음";
  } else {
    // 근무 중이 아닌 경우
    const workRecords = response?.targetDayWorkSchedule?.workRecords;

    if (workRecords && workRecords.length > 0) {
      // 첫 번째 근무 시작 시간 이전인지 확인
      const firstWorkStart = workRecords[0]?.blockTimeFrom?.timeStamp;

      if (firstWorkStart && response.requestedAt < firstWorkStart) {
        return "시작 전";
      } else {
        // 마지막 근무 종료 시간 이후인지 확인
        const lastWorkEnd = workRecords[workRecords.length - 1]?.blockTimeTo?.timeStamp;

        if (lastWorkEnd && response.requestedAt > lastWorkEnd) {
          return "근무 종료";
        } else {
          return "휴게";
        }
      }
    }
  }

  return "알 수 없음";
};

export default function useGetCurrentStatus() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (
      cookie: string,
    ): Promise<{ realtimeStatus: RealtimeStatus; requestedAt: CurrentStatusData["requestedAt"] }> => {
      const cachedData = getCache<{ realtimeStatus: RealtimeStatus; requestedAt: CurrentStatusData["requestedAt"] }>(
        STATUS_CACHE_KEY,
      );
      if (cachedData) {
        return cachedData;
      }

      const response = await getCurrentStatus({ userId, cookie });

      const realtimeStatus = determineCurrentState(response);

      return {
        realtimeStatus,
        requestedAt: response.requestedAt,
      };
    },
    [preferences.cookie],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(STATUS_CACHE_KEY)) {
          setCacheForNextMinute(STATUS_CACHE_KEY, JSON.stringify(data), data.requestedAt);
        }
      },
      onError: () => {
        clearCache();
      },
    },
  );

  return result;
}
