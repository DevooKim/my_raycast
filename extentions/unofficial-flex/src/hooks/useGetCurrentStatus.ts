import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useRef } from "react";

import type { RealtimeStatus, CurrentStatusResponse } from "../types/currentStatus";
import { WorkForm } from "../types/workForm";

import { CACHE_KEY, clearCache, getCache, isStaleCache, setCacheForNextMinute } from "../utils/cache";
import { seoulDayjs } from "../utils/dayjs.timezone";
import { getCurrentStatus } from "../fetches/getCurrentStatus";

const STATUS_CACHE_KEY = CACHE_KEY.STATUS;

const determineCurrentState = (response: CurrentStatusResponse): RealtimeStatus => {
  if (response?.onGoingRecordPack?.onGoing) {
    // 현재 근무 중인 경우
    return WorkForm[response?.onGoingRecordPack?.startRecord?.customerWorkFormId] ?? "휴게";
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

const calcCurrentWorkingTimeMinutes = (
  response: CurrentStatusResponse,
): {
  currentWorkingMinutes: number;
  recordingRestMinutes: number;
} => {
  // 근무시작시간 ~ 요청시간
  const workTypeRecordingMinute = seoulDayjs(response.requestedAt).diff(
    response.onGoingRecordPack?.startRecord?.targetTime ?? response.requestedAt,
    "minute",
  );

  // (휴게시작시간 ~ 요청시간) - (휴게종료시간 ~ 요청시간)
  const restTypeRecordingMinute =
    response.onGoingRecordPack?.restRecords?.reduce((acc, record) => {
      const requestToStart = Math.min(seoulDayjs(record?.restStartRecord?.targetTime).diff(response.requestedAt), 0);
      const requestToStop = Math.min(seoulDayjs(record?.restStopRecord?.targetTime).diff(response.requestedAt), 0);

      return acc + seoulDayjs(requestToStop).diff(seoulDayjs(requestToStart), "minute");
    }, 0) ?? 0;

  const 현재_기록중인_근무시간_minute = Math.max(workTypeRecordingMinute - restTypeRecordingMinute, 0);

  // 근무로 기록된 시간
  const workTypeRecordedMinute = response.targetDayWorkSchedule.workRecords
    .filter((record) => record.workFormType === "WORK")
    .reduce((acc, record) => {
      const start = record.blockTimeFrom.timeStamp;
      const end = record.blockTimeTo.timeStamp;
      return seoulDayjs(end).diff(seoulDayjs(start), "minute") + acc;
    }, 0);

  // 휴게로 기록된 시간
  const restTypeRecordedMinute = response.targetDayWorkSchedule.workRecords
    .filter((record) => record.workFormType === "REST")
    .reduce((acc, record) => {
      const start = record.blockTimeFrom.timeStamp;
      const end = record.blockTimeTo.timeStamp;
      return seoulDayjs(end).diff(seoulDayjs(start), "minute") + acc;
    }, 0);

  const recordsMinute = workTypeRecordedMinute - restTypeRecordedMinute;

  return {
    currentWorkingMinutes: 현재_기록중인_근무시간_minute + recordsMinute,
    recordingRestMinutes: restTypeRecordingMinute,
  };
};

export interface CurrentStatus {
  realtimeStatus: RealtimeStatus;
  currentWorkingMinutes: number;
  recordingRestMinutes: number;
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
      const { currentWorkingMinutes, recordingRestMinutes } = calcCurrentWorkingTimeMinutes(response);

      return {
        realtimeStatus,
        currentWorkingMinutes,
        recordingRestMinutes,
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
