export type TimeOffUseStatus = "APPROVAL_COMPLETED" | "APPROVAL_WAITING";
export type TimeOffRegisterUnit = "DAY" | "HALF_DAY_PM" | "HALF_DAY_AM";
export type ApprovalStatus = "APPROVED" | "WAITING";
export type TimeOffPolicyType = "CUSTOM" | "ANNUAL";
export type CertificateSubmissionLimit = "NONE" | "SUBMIT_ON_APPLY";
export type MinimumUsageLimit = "DAY";

export const TimeOffRegisterUnitValue = {
  DAY: "연차",
  HALF_DAY_PM: "오후 반차",
  HALF_DAY_AM: "오전 반차",
} as const;

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
  timeOffPolicyType?: TimeOffPolicyType;
  useTime?: {
    timeOffDays: number;
    timeOffMinutes: number;
    timeOffTimeAmount: TimeOffTimeAmount;
  };
  useInAdvance?: boolean;
  useInAdvanceAmount?: {
    timeOffDays: number;
    timeOffTimeAmount: TimeOffTimeAmount;
  };
  certificateSubmissionLimit?: CertificateSubmissionLimit;
}

export interface DisplayInfo {
  name: string;
  description: string;
  displayOrder: number;
  emoji?: { common: string };
  icon?: { key: string; color: string };
}

export interface CustomTimeOffForm {
  customerIdHash: string;
  timeOffPolicyId: string;
  timeOffPolicyType: TimeOffPolicyType;
  minimumUsageLimit: MinimumUsageLimit;
  displayInfo: DisplayInfo;
}

export interface TimeOffData {
  timeOffUses: TimeOffUse[];
  customTimeOffForms: CustomTimeOffForm[];
  requestedAt: number;
  hasNext?: boolean;
}
