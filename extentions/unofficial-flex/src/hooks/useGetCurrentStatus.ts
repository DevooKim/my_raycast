import { getPreferenceValues } from "@raycast/api";
import { AsyncState, useCachedPromise, usePromise } from "@raycast/utils";
import { useRef } from "react";

import type { RealtimeStatus, CurrentStatusResponse } from "../types/currentStatus";
import { WorkForm } from "../types/workForm";

import { AuthError } from "../errors/AuthError";
import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { seoulDayjs } from "../utils/dayjs.timezone";

const STATUS_CACHE_KEY = CACHE_KEY.STATUS;

const getCurrentStatus = async ({
  userId,
  cookie,
}: {
  userId: string;
  cookie: string;
}): Promise<CurrentStatusResponse> => {
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

  const fetchedData = (await response.json()) as CurrentStatusResponse;
  const responseDate = new Date(response.headers.get("date") || "");

  return {
    ...fetchedData,
    requestedAt: new Date(responseDate).getTime(),
  };
};

const determineCurrentState = (response: CurrentStatusResponse): RealtimeStatus => {
  if (response?.onGoingRecordPack?.onGoing === true) {
    // 현재 근무 중인 경우
    return WorkForm[response?.onGoingRecordPack?.startRecord?.customerWorkFormId] || "알 수 없음";
  }

  const workRecords = response?.targetDayWorkSchedule?.workRecords;
  const timeOffs = response?.targetDayWorkSchedule?.timeOffs;

  if (workRecords.length === 0 && timeOffs.length === 0) {
    return "시작 전";
  }

  // TODO: 휴가 상태 추가

  const lastRecord = workRecords[workRecords.length - 1];
  const lastRecordEnd = lastRecord?.blockTimeTo?.timeStamp;

  if (lastRecordEnd && response.requestedAt > lastRecordEnd) {
    // 마지막 근무 종료 시간 이후인지 확인
    return "근무 종료";
  }

  return "알 수 없음";
};

const calcCurrentWorkingTimeMinutes = (response: CurrentStatusResponse): number => {
  const recordsMinute = response.targetDayWorkSchedule.workRecords.reduce((acc, record) => {
    const start = record.blockTimeFrom.timeStamp;
    const end = record.blockTimeTo.timeStamp;
    return seoulDayjs(end).diff(seoulDayjs(start), "minute") + acc;
  }, 0);

  const restTypeRecordsMinute = response.targetDayWorkSchedule.workRecords
    .filter((record) => record.workFormType === "REST")
    .reduce((acc, record) => {
      const start = record.blockTimeFrom.timeStamp;
      const end = record.blockTimeTo.timeStamp;
      return seoulDayjs(end).diff(seoulDayjs(start), "minute") + acc;
    }, 0);

  return recordsMinute - restTypeRecordsMinute;
};

export interface CurrentStatus {
  realtimeStatus: RealtimeStatus;
  currentWorkingMinutes: number;
  requestedAt: CurrentStatusResponse["requestedAt"];
}

type CachedPromise = (cookie: string) => Promise<CurrentStatus>;

export default function useGetCurrentStatus() {
  const preferences = getPreferenceValues<Preferences>();
  const userId = preferences.userId;

  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise<CachedPromise>(
    async (cookie: string) => {
      const cachedData = getCache<CurrentStatus>(STATUS_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      const response = await getCurrentStatus({ userId, cookie });

      const realtimeStatus = determineCurrentState(response);
      const currentWorkTime = calcCurrentWorkingTimeMinutes(response);

      return {
        realtimeStatus,
        currentWorkingMinutes: currentWorkTime,
        requestedAt: response.requestedAt,
      };
    },
    [preferences.cookie],
    {
      abortable,
      onData: (data) => {
        if (isStaleCache(STATUS_CACHE_KEY)) {
          setCacheForNextMinute({ key: STATUS_CACHE_KEY, value: JSON.stringify(data), timestamp: data.requestedAt });
        }
      },
      onError: () => {
        clearCache();
      },
    },
  );

  return result;
}
