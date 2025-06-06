import { Action, ActionPanel, Color, Form, Icon, List } from "@raycast/api";

import useGetCurrentStatus from "./hooks/useGetCurrentStatus";
import useGetDateAttribute from "./hooks/useGetDateAttribute";
import useGetScheduleSummary from "./hooks/useGetScheduleSummary";
import useGetTimeOff from "./hooks/useGetTimeOff";

import { type RealtimeStatus } from "./types/currentStatus";
import { TimeOffRegisterUnitValue } from "./types/timeOff";

import { seoulDayjs } from "./utils/dayjs.timezone";
import { minutesToDayString, minutesToHourString } from "./utils/string";
import { getNotPassedTimeOffDays, calculateWorkingPeriod } from "./utils/calculateData";
import useGetIsValidCookie from "./hooks/useGetIsValidCookie";
import { AuthError } from "./errors/AuthError";
import { COOKIE_KEY, setCookie } from "./utils/cookie";

const ScheduleSummary = () => {
  const scheduleSummary = useGetScheduleSummary();
  const dateAttributes = useGetDateAttribute();
  const currentStatus = useGetCurrentStatus();
  const timeOff = useGetTimeOff();

  const isLoading =
    scheduleSummary.isLoading || dateAttributes.isLoading || currentStatus.isLoading || timeOff.isLoading;
  const error = scheduleSummary.error || dateAttributes.error || currentStatus.error || timeOff.error;

  if (isLoading) {
    return <List.Item title="Loading..." />;
  }
  if (error) {
    return <List.Item title="Error" subtitle={error.message} />;
  }

  const 지나지않은연차일 = getNotPassedTimeOffDays(timeOff.data!.timeOffList).reduce((acc, timeOffEvent) => {
    const offset = timeOffEvent.timeOffRegisterUnit === "DAY" ? 1 : 0.5;
    return acc + offset;
  }, 0);

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

  const isLoading = currentStatus.isLoading;
  const error = currentStatus.error;

  if (isLoading) {
    return <List.Item title="Loading..." />;
  }
  if (error) {
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

  const isLoading = timeOff.isLoading;
  const error = timeOff.error;

  if (isLoading) {
    return <List.Item title="Loading..." />;
  }
  if (error) {
    return <List.Item title="Error" subtitle={error.message} />;
  }

  const getColor = (blockDate: string) => {
    const today = seoulDayjs();

    if (today.isAfter(seoulDayjs(blockDate), "day")) {
      return Color.SecondaryText;
    }

    return Color.Yellow;
  };

  const timeOffList = timeOff.data!.timeOffList;
  const timeOffPolicyMap = timeOff.data!.timeOffPolicyMap;

  return (
    <>
      {timeOffList.map((timeOffEvent) => (
        <List.Item
          key={`${timeOffEvent.blockDate}-${timeOffEvent.userTimeOffRegisterEventId}`}
          title={`${timeOffEvent.blockDate} ${seoulDayjs(timeOffEvent.blockDate).format("dd")}`}
          subtitle={timeOffPolicyMap[timeOffEvent.timeOffPolicyId]?.name}
          accessories={[
            {
              tag: {
                value: TimeOffRegisterUnitValue[timeOffEvent.timeOffRegisterUnit],
                color: getColor(timeOffEvent.blockDate),
              },
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

  const { isLoading, error, revalidate } = useGetIsValidCookie();

  if (error instanceof AuthError) {
    return (
      <Form
        enableDrafts
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Save Cookie"
              onSubmit={async (values) => {
                console.log("values", values);
                await setCookie(values[COOKIE_KEY]);

                revalidate();
              }}
            />
          </ActionPanel>
        }
      >
        <Form.PasswordField title="Cookie" id={COOKIE_KEY} defaultValue="" autoFocus info="AID" />
      </Form>
    );
  }

  return (
    <List isLoading={isLoading}>
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
