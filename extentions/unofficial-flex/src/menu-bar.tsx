import { Icon, MenuBarExtra } from "@raycast/api";
import useGetCurrentStatus from "./hooks/useGetCurrentStatus";
import { minutesToHourString } from "./utils/string";
import { RealtimeStatus } from "./types/currentStatus";

export default function Command() {
  const currentStatus = useGetCurrentStatus();

  const error = currentStatus.error;
  if (error) {
    return <MenuBarExtra.Item title="Error" subtitle={error.message} />;
  }

  const 현재_근무상태 = currentStatus.data!.realtimeStatus;
  const { currentWorkingMinutes, recordingRestMinutes } = currentStatus.data!;

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

  return (
    <MenuBarExtra
      isLoading={currentStatus.isLoading}
      icon={statusIcon(현재_근무상태)}
      title={
        현재_근무상태 === "시작 전"
          ? 현재_근무상태
          : minutesToHourString(현재_근무상태 === "휴게" ? recordingRestMinutes : currentWorkingMinutes)
      }
    >
      <MenuBarExtra.Item title="Seen" />
      <MenuBarExtra.Item
        title="Example Seen Pull Request"
        onAction={() => {
          console.log("seen pull request clicked");
        }}
      />
      <MenuBarExtra.Item title="Unseen" />
      <MenuBarExtra.Item
        title="Example Unseen Pull Request"
        onAction={() => {
          console.log("unseen pull request clicked");
        }}
      />
    </MenuBarExtra>
  );
}
