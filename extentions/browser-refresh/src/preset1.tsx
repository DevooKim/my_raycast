import { useCachedPromise } from "@raycast/utils";
import { getStorage } from "./utils/storage";
import { Detail } from "@raycast/api";

export default function Preset1() {
  const { data } = useCachedPromise(() => getStorage(), []);

  if (!data?.[0]) {
    return <Detail markdown={`No presets found. Please create a preset first.`} />;
  }

  return <Detail markdown={`${data[0].name} - ${data[0].keyword} - ${data[0].mode}`} />;
}
