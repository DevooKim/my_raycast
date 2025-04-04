export interface WorkingDayAttribute {
  date: string;
  timezone: string;
  startTimestamp: number;
  endTimestampExclusive: number;
  dateType: "IN_EMPLOY";
  dayOffs: DayOff[];
  customerWorkRuleId: string;
  recommendedRestTimeRanges: RestTimeRange[];
  usualWorkingMinutes: number;
  locks: Lock[];
}

export interface DayOff {
  date: string;
  name: string;
  type: "REST_DAY" | "WEEKLY_HOLIDAY" | "CUSTOM_HOLIDAY";
}

export interface RestTimeRange {
  start: string;
  endInclusive: string;
  dayPassed: boolean;
}

export interface Lock {
  triggerType: "WORK_SCHEDULE_LOCK";
}

export interface DateAttributesData {
  workingDayAttributes: WorkingDayAttribute[];
  requestedAt: number; //timestamp
}
