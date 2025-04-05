export type TimeOffUseStatus = 'APPROVAL_COMPLETED' | 'APPROVAL_WAITING';
export type TimeOffRegisterUnit = 'DAY' | 'HALF_DAY_PM' | 'HALF_DAY_AM';
export type ApprovalStatus = 'APPROVED' | 'WAITING';

export interface TimeOffTimeAmount {
  days: number;
  hours: number;
  minutes: number;
}

export interface UserTimeOffRegisterEventBlock {
  customerIdHash: string;
  userIdHash: string;
  userTimeOffRegisterEventId: string;
  timeOffRegisterUnit: TimeOffRegisterUnit;
  blockDate: string;
  blockTimeFrom?: string;
  blockTimeTo?: string;
  restMinutes: number;
  usedMinutes: number;
  dailyTimeOffMinutes: number;
}

export interface ApprovalStatusData {
  status: ApprovalStatus;
  taskKey: string;
  targetEventIdHash: string;
  hasNoReviewers: boolean;
}

export interface TimeOffUse {
  userTimeOffRegisterEventId: string;
  timeOffUseStatus: TimeOffUseStatus;
  customerIdHash: string;
  userIdHash: string;
  timeOffRegisterDateFrom: string;
  timeOffRegisterDateTo: string;
  applyTimeStampFrom: number;
  applyTimeStampTo: number;
  zoneId: string;
  timeOffPolicyId: string;
  userTimeOffRegisterEventBlocks: UserTimeOffRegisterEventBlock[];
  approvalStatus: ApprovalStatusData;
  cancelApprovalInProgress: boolean;
  timeOffRegisteredAt: number;
  canceled: boolean;
  customerId: number;
  userId: number;
}

export interface TimeOffData {
  timeOffUses: TimeOffUse[];
  requestedAt: number;
}