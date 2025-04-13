import { Color, Icon, List } from "@raycast/api";
import useGetScheduleSummary from "./hooks/useGetScheduleSummary";
import useGetCurrentStatus from "./hooks/useGetCurrentStatus";
import { minutesToDayString, minutesToHourString } from "./utils/string";
import useGetTimeOff from "./hooks/useGetTimeOff";
import { RealtimeStatus } from "./types/currentStatus";
import useGetDateAttribute from "./hooks/useGetDateAttribute";
import { seoulDayjs } from "./utils/dayjs.timezone";
import { TimeOffRegisterUnitValue } from "./types/timeOff";
import { DateAttributes } from "./types/dateAttributes";
import { ScheduleSummaryData } from "./types/scheduleSummary";

interface calculateWorkingPeriodParams {
  dateAttributesData: DateAttributes;
  scheduleSummaryData: ScheduleSummaryData;
  지나지않은연차일: number;
  현재_근무상태: RealtimeStatus;
}

const calculateWorkingPeriod = ({
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

const ScheduleSummary = () => {
  const scheduleSummary = useGetScheduleSummary();
  const dateAttributes = useGetDateAttribute();
  const currentStatus = useGetCurrentStatus();

  if (scheduleSummary.isLoading || dateAttributes.isLoading || currentStatus.isLoading) {
    return <List.Item title="Loading..." />;
  }
  if (scheduleSummary.error) {
    return <List.Item title="Error" subtitle={scheduleSummary.error.message} />;
  }
  if (dateAttributes.error) {
    return <List.Item title="Error" subtitle={dateAttributes.error.message} />;
  }
  if (currentStatus.error) {
    return <List.Item title="Error" subtitle={currentStatus.error.message} />;
  }

  const 지나지않은연차일 = 5;
  const 이번달_근무일 = calculateWorkingPeriod({
    dateAttributesData: dateAttributes.data!,
    scheduleSummaryData: scheduleSummary.data!,
    현재_근무상태: currentStatus.data!.realtimeStatus,
    지나지않은연차일,
  });

  const 이번달_연차_minutes = scheduleSummary.data!.result.timeOffUseResultsByTimeOffPolicies.reduce(
    (acc, timeOffUseResult) => acc + timeOffUseResult.totalMinutes,
    0,
  );

  const 이번달_근무시간_minutes = scheduleSummary.data!.result.totalRecognizedWorkingMinutes;
  const 이번달_해야하는_근무시간_minutes = 8 * 60 * 이번달_근무일.전체;
  const 이번달_남은_최소_근무시간_minutes = Math.max(이번달_해야하는_근무시간_minutes - 이번달_근무시간_minutes, 0);

  const 오차시간 = 이번달_근무일.남은_연차제외 * 8 * 60 - 이번달_남은_최소_근무시간_minutes;

  return (
    <>
      <List.Item
        title="이번 달 근무일"
        accessories={[
          {
            text: {
              value: `${이번달_근무일.남은} / ${이번달_근무일.전체}`,
              color: Color.Blue,
            },
            icon: Icon.Calendar,
          },
          {
            text: {
              value: `${이번달_근무일.남은_연차제외} / ${이번달_근무일.전체_연차제외}`,
              color: Color.Yellow,
            },
            icon: Icon.Calendar,
            tooltip: `연차 ${minutesToDayString(이번달_연차_minutes)}`,
          },
        ]}
      />

      <List.Item
        title="이번 달 근무 시간"
        accessories={[
          {
            text: {
              value: `${minutesToHourString(이번달_근무시간_minutes)} / ${minutesToHourString(이번달_해야하는_근무시간_minutes)}`,
              color: Color.Blue,
            },
            icon: Icon.Clock,
          },
          {
            tag: {
              value: `연차 ${minutesToHourString(이번달_연차_minutes)} 포함`,
            },
          },
        ]}
      />
      <List.Item
        title="이번 달 남은 최소 근무 시간"
        accessories={[
          {
            text: {
              value: `${minutesToHourString(이번달_남은_최소_근무시간_minutes)}`,
              color: Color.Blue,
            },
            icon: Icon.Clock,
          },
          {
            text: {
              value: `${minutesToHourString(오차시간)}`,
              color: 오차시간 > 0 ? Color.Green : Color.Red,
            },
            icon: Icon.Clock,
          },
        ]}
      />
    </>
  );
};

const CurrentStatus = () => {
  const currentStatus = useGetCurrentStatus();

  if (currentStatus.isLoading) {
    return <List.Item title="Loading..." />;
  }
  if (currentStatus.error) {
    return <List.Item title="Error" subtitle={currentStatus.error.message} />;
  }

  const statusColor = (status: RealtimeStatus) => {
    switch (status) {
      case "시작 전":
        return Color.PrimaryText;
      case "근무 종료":
        return Color.Orange;
      case "알 수 없음":
        return Color.Red;
      case "휴게":
        return Color.Yellow;
      default:
        return Color.Blue;
    }
  };

  const statusIcon = (status: RealtimeStatus) => {
    switch (status) {
      case "시작 전":
        return Icon.Signal0;
      case "근무 종료":
        return Icon.House;
      case "알 수 없음":
        return Icon.XMarkCircle;
      case "휴게":
        return Icon.MugSteam;
      // case "휴가":
      //   return Icon.Airplane;
      default:
        return Icon.Signal3;
    }
  };

  const 현재_근무상태 = currentStatus.data!.realtimeStatus;
  const { currentWorkingMinutes, recordingRestMinutes } = currentStatus.data!;

  const isBeforeWork = 현재_근무상태 === "시작 전";

  const accessories = [
    {
      text: { value: currentStatus.data!.realtimeStatus, color: statusColor(현재_근무상태) },
      icon: statusIcon(현재_근무상태),
    },
    !isBeforeWork && {
      text: {
        value: minutesToHourString(현재_근무상태 === "휴게" ? recordingRestMinutes : currentWorkingMinutes),
        color: statusColor(현재_근무상태),
      },
      icon: Icon.Hammer,
    },
  ].filter(Boolean) as List.Item.Accessory[];

  return (
    <>
      <List.Item title="출근 상태" accessories={accessories} />
    </>
  );
};

const TimeOff = () => {
  const timeOff = useGetTimeOff();

  if (timeOff.isLoading) {
    return <List.Item title="Loading..." />;
  }
  if (timeOff.error) {
    return <List.Item title="Error" subtitle={timeOff.error.message} />;
  }

  const timeOffList = timeOff.data!.timeOffList;
  const timeOffPolicyMap = timeOff.data!.timeOffPolicyMap;

  return (
    <>
      {timeOffList.map((timeOffEvent) => (
        <List.Item
          key={`${timeOffEvent.blockDate}-${timeOffEvent.userTimeOffRegisterEventId}`}
          title={timeOffEvent.blockDate}
          subtitle={timeOffPolicyMap[timeOffEvent.timeOffPolicyId]?.name}
          accessories={[
            {
              tag: { value: TimeOffRegisterUnitValue[timeOffEvent.timeOffRegisterUnit], color: Color.Blue },
              icon: Icon.Airplane,
            },
            { text: minutesToHourString(timeOffEvent.usedMinutes) },
          ]}
        />
      ))}
    </>
  );
};

export default function Command() {
  const now = seoulDayjs();
  const currentMonth = now.format("M");

  return (
    <List>
      <List.Section title={`${currentMonth}월 정보`}>
        <ScheduleSummary />
      </List.Section>
      <List.Section title="현재 근무 상태">
        <CurrentStatus />
      </List.Section>
      <List.Section title="휴가 정보">
        <TimeOff />
      </List.Section>
    </List>
  );
}
