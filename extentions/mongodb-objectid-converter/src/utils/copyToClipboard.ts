import { Clipboard, closeMainWindow, PopToRootType, showHUD } from "@raycast/api";

export default async function copyToClipboard(copyValue: string, HudMessage: string) {
  await Clipboard.copy(copyValue);
  showHUD(HudMessage);

  closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate });
}
