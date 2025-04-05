import type { WorkForm } from "./workForm";

export type RealtimeStatus =
  | "시작 전"
  | "근무 중"
  | "근무 종료"
  | "알 수 없음"
  | (typeof WorkForm)[keyof typeof WorkForm];

export interface TargetDayWorkSchedule {
  date: string;
  workRecords: WorkRecord[];
  timeOffs: unknown[]; // 필요에 따라 더 구체적인 타입으로 정의 가능
}

export interface WorkRecord {
  customerWorkFormId: keyof typeof WorkForm;
  blockTimeFrom: TimeBlock;
  blockTimeTo: TimeBlock;
  workFormType: "WORK" | "REST";
  eventStatus: string;
  eventSource: string;
  fromRecommendedRestTime: boolean;
}

export interface TimeBlock {
  zoneId: string;
  timeStamp: number;
}

export interface WorkBlock {
  blockTimeFrom: TimeBlock;
  blockTimeTo: TimeBlock;
  legalCategory: string;
}

export interface OnGoingRecordPack {
  startRecord: {
    id: string;
    eventType: string;
    targetTime: number;
    customerWorkFormId: keyof typeof WorkForm;
    recordType: string;
    zoneId: string;
  };
  switchRecords: unknown[];
  restRecords: unknown[];
  onGoing: boolean;
}

export interface CurrentStatusData {
  targetDate: string;
  targetDayWorkSchedule: TargetDayWorkSchedule;
  onGoingRecordPack?: OnGoingRecordPack;
  appliedZoneId: string;
  requestedAt: number;
}
