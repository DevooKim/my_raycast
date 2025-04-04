// 시간 관련 타입 정의
export interface Period {
  from: number;
  to: number;
}

// 휴가 정책 결과 타입
export interface TimeOffPolicyResult {
  policyType: string;
  policyId: string;
  totalMinutes: number;
  name: string;
}

// 법정 근무 시간 컬렉션 타입
export interface LegalWorkMinutesCollection {
  normalWorkMinutes: number;
  regardedOverWorkMinutes: number;
  regardedOverNightWorkMinutes: number;
  overWorkMinutes: number;
  nightWorkMinutes: number;
  holidayWorkMinutes: number;
  overNightWorkMinutes: number;
  holidayOverWorkMinutes: number;
  holidayNightWorkMinutes: number;
  holidayOverNightWorkMinutes: number;
}

// 근무 결과 타입
export interface WorkResult {
  timezone: string;
  period: Period;

  totalRecognizedWorkingMinutes: number; // 총 근무 시간 (휴가 포함)

  totalTimeOffMinutes: number; // 총 휴가 시간

  timeOffUseResultsByTimeOffPolicies: TimeOffPolicyResult[];
  legalWorkMinutesCollection: LegalWorkMinutesCollection;
}

// 유연근무제 결과 타입
export interface FullFlexibleResult {
  requiredWorkingMinutes: number;
  remainingDaysByEndDateOfWorkingPeriod: number; // 실제 출근 일 수
  recommendDailyWorkingMinutes: number;
  remainingOverWorkingMinutes: number;
  inSufficientWorkingMinutesWarning: boolean;
  maxOverWorkingMinutesWarning: boolean;
}

// 전체 데이터 응답 타입
export interface SummaryData {
  result: WorkResult;
  resultForFullFlexible: FullFlexibleResult;
  updatedAt: number; //timestamp
}
