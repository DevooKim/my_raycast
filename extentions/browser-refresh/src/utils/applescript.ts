import { captureException } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";

//Arc, Safari, Firefox, Hammerspoon, iTerm2, Google Chrome
const TEST_URL = "https://raycast.com";
const NAME = "Arc";

export const refreshAllWindowsChromium = async (browser: string) => {
  try {
    return await runAppleScript(`
          tell application "${browser}"
            repeat with w from 1 to (count of windows)
                tell window w
                    repeat with t from 1 to (count of tabs)
                        tell tab t
                            reload
                        end tell
                    end repeat
                end tell
            end repeat
          end tell
        `);
  } catch (error) {
    captureException(error);
  }
};

export const refreshFirstWindowChromium = async (browser: string) => {
  try {
    return await runAppleScript(`
        tell application "${browser}"
            tell window 1
                repeat with t from 1 to (count of tabs)
                    tell tab t
                        reload
                    end tell
                end repeat
            end tell
        end tell
    `);
  } catch (error) {
    captureException(error);
  }
};

export const refreshAllWindowsSafari = async () => {
  try {
    return await runAppleScript(`
        tell application "Safari"
            repeat with w from 1 to (count of windows)
                tell window w
                    repeat with t from 1 to (count of tabs)
                        tell tab t
                            do JavaScript "location.reload()"
                        end tell
                    end repeat
                end tell
            end repeat
        end tell
    `);
  } catch (error) {
    captureException(error);
  }
};

export const refreshFirstWindowSafari = async () => {
  try {
    return await runAppleScript(`
            tell application "Safari"
                tell window 1
                    repeat with t from 1 to (count of tabs)
                        tell tab t
                            do JavaScript "location.reload()"
                        end tell
                    end repeat
                end tell
            end tell
        `);
  } catch (error) {
    captureException(error);
  }
};
