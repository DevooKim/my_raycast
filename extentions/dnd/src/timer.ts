import { LaunchProps } from "@raycast/api";
import { timerDND } from "./utils";

type Props = {
  minutes?: number;
};

export default async (props: LaunchProps<{ arguments: Props }>) => {
  const { minutes } = props.arguments;

  await timerDND(minutes);
};
