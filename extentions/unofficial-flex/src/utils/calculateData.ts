import { TimeOffListItem } from "../hooks/useGetTimeOff";
import { RealtimeStatus } from "../types/currentStatus";
import { DateAttributes } from "../types/dateAttributes";
import { ScheduleSummaryData } from "../types/scheduleSummary";
import { seoulDayjs } from "./dayjs.timezone";

interface calculateWorkingPeriodParams {
  dateAttributesData: DateAttributes;
  scheduleSummaryData: ScheduleSummaryData;
  지나지않은연차일: number;
  현재_근무상태: RealtimeStatus;
}

export const calculateWorkingPeriod = ({
  dateAttributesData,
  scheduleSummaryData,
  현재_근무상태,
  지나지않은연차일,
}: calculateWorkingPeriodParams) => {
  const 전체 = dateAttributesData.totalDaysOfMonth - dateAttributesData.dayOffCountOfMonth;
  const 전체_연차제외 = 전체 - 지나지않은연차일;
  const 남은 =
    scheduleSummaryData.resultForFullFlexible.remainingDaysByEndDateOfWorkingPeriod +
    지나지않은연차일 -
    (현재_근무상태 === "근무 종료" ? 1 : 0);
  const 남은_연차제외 = 남은 - 지나지않은연차일;

  return {
    전체,
    전체_연차제외,
    남은,
    남은_연차제외,
  };
};

export const getNotPassedTimeOffDays = (timeOffList: TimeOffListItem[]): TimeOffListItem[] => {
  const today = seoulDayjs();

  return timeOffList.filter((timeOff) => {
    const blockDate = seoulDayjs(timeOff.blockDate);
    return blockDate.isAfter(today, "day") || (blockDate.isSame(today, "day") && timeOff.usedMinutes > 0);
  });
};
