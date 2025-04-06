import { Color, Detail, Icon, List } from "@raycast/api";
import useGetScheduleSummary from "./hooks/useGetScheduleSummary";
import useGetCurrentStatus from "./hooks/useGetCurrentStatus";
import { minutesToHourString } from "./utils/string";
import useGetTimeOff from "./hooks/useGetTimeOff";
import { CurrentStatusResponse, RealtimeStatus } from "./types/currentStatus";

const Mock = () => {
  return (
    <List>
      <List.Item
        title="An Item with Accessories"
        accessories={[
          { text: `An Accessory Text`, icon: Icon.Hammer },
          { text: { value: `A Colored Accessory Text`, color: Color.Orange }, icon: Icon.Hammer },
          { icon: Icon.Person, tooltip: "A person" },
          { text: "Just Do It!" },
          { date: new Date() },
          { tag: new Date() },
          { tag: { value: new Date(), color: Color.Magenta } },
          { tag: { value: "User", color: Color.Magenta }, tooltip: "Tag with tooltip" },
        ]}
      />
    </List>
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
      default:
        return Color.Blue;
    }
  };

  const 현재_근무상태 = currentStatus.data!.realtimeStatus;
  const 현재_근무시간_minutes = currentStatus.data!.currentWorkingMinutes;

  const isWorking = !(현재_근무상태 === "시작 전" || 현재_근무상태 === "알 수 없음" || 현재_근무상태 === "근무 종료");

  const accessories = [
    { text: { value: currentStatus.data!.realtimeStatus, color: statusColor(현재_근무상태) }, icon: Icon.Hammer },
    isWorking && {
      text: { value: minutesToHourString(현재_근무시간_minutes), color: Color.Green },
      icon: Icon.Hammer,
    },
  ].filter(Boolean) as List.Item.Accessory[];

  return (
    <>
      <List.Item title="출근 상태" accessories={accessories} />
    </>
  );
};

const ScheduleSummary = () => {
  const scheduleSummary = useGetScheduleSummary();

  if (scheduleSummary.isLoading) {
    return <List.Item title="Loading..." />;
  }
  if (scheduleSummary.error) {
    return <List.Item title="Error" subtitle={scheduleSummary.error.message} />;
  }

  const 이번달_근무시간_minutes = scheduleSummary.data!.result.totalRecognizedWorkingMinutes;

  return (
    <List.Item
      title="이번 달 근무 시간"
      accessories={[
        { text: { value: minutesToHourString(이번달_근무시간_minutes), color: Color.Blue }, icon: Icon.Hammer },
      ]}
    />
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

  return (
    <>
      {timeOffList.map((timeOff) => (
        <List.Item
          key={timeOff.userTimeOffRegisterEventId}
          title={timeOff.blockDate}
          subtitle={timeOff.userTimeOffRegisterEventId}
          accessories={[
            { tag: { value: timeOff.timeOffRegisterUnit, color: Color.Blue }, icon: Icon.Hammer },
            { text: minutesToHourString(timeOff.usedMinutes), icon: Icon.Hammer },
          ]}
        />
      ))}
    </>
  );
};

export default function Command() {
  return (
    <List>
      <List.Section title="월 정보">
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
