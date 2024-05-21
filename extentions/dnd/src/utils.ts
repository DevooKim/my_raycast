import { exec, execSync } from "child_process";
import { open, showHUD, Cache, showToast, Toast } from "@raycast/api";

const DNDshortcutName = `DND`;

const cache = new Cache();

async function installShortcuts(): Promise<void> {
  const shortcutPath = `${__dirname}/assets/${DNDshortcutName}.shortcut`;
  await open(shortcutPath);
}

async function executeDNDCommand(command: string) {
  clearPrevProcess();
  execSync(`echo "${command}" | shortcuts run "${DNDshortcutName}"`);
  const isOn = await getDNDStatus();
  return isOn;
}

async function handleDNDCommandError(error: unknown) {
  if (error instanceof Error && error.message.includes("WFBackgroundShortcutRunnerErrorDomain")) {
    await showHUD("단축어를 설치해주세요.");
    await installShortcuts();
  }
}

export async function turnOnDND() {
  try {
    const isOn = await executeDNDCommand("on");
    if (isOn) {
      await showHUD(`Do Not Disturb is on`);
    }
  } catch (error) {
    await handleDNDCommandError(error);
  }
}

export async function turnOffDND() {
  try {
    const isOn = await executeDNDCommand("off");
    if (!isOn) {
      await showHUD(`Do Not Disturb is off`);
    }
  } catch (error) {
    await handleDNDCommandError(error);
  }
}

export async function statusDND() {
  try {
    const isOn = await getDNDStatus();
    await showHUD(`Do Not Disturb is ${isOn ? "on" : "off"}`);
  } catch (error) {
    await handleDNDCommandError(error);
  }
}

export async function toggleDND() {
  try {
    const isOn = await executeDNDCommand("toggle");
    await showHUD(`Do Not Disturb is ${isOn ? "on" : "off"}`);
  } catch (error) {
    await handleDNDCommandError(error);
  }
}

export function getDNDStatus() {
  const stdout = execSync(`echo "status" | shortcuts run "${DNDshortcutName}" | cat`);
  return stdout.toString() !== "";
}

function clearPrevProcess() {
  const cached = cache.get("process_id");
  if (cached) {
    const { pid, child_id } = JSON.parse(cached);

    exec(`kill -9 ${child_id}`);
    exec(`kill -9 ${pid}`);
    cache.remove("process_id");
  }
}

function handleProcess(pid: number) {
  const ppid = execSync(`ps -p ${pid} -o ppid=`).toString().trim();

  const child_id = execSync(`pgrep -P ${pid}`).toString().trim();

  clearPrevProcess();
  cache.set("process_id", JSON.stringify({ pid, ppid, child_id }));

  return { pid, ppid, child_id };
}

export async function timerDND(_minutes: number | undefined) {
  const minutes = _minutes || 60;

  const executionResult = exec(
    `echo "on" | shortcuts run "${DNDshortcutName}" && sleep ${minutes * 60} && echo "off" | shortcuts run "${DNDshortcutName}"`,
  );

  const pid = executionResult.pid;

  if (!pid) {
    await showHUD("Failed to start Do Not Disturb");
    return;
  }

  const toast = await showToast({
    title: "Do Not Disturb",
    message: `Running`,
    style: Toast.Style.Animated,
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      handleProcess(pid);
      resolve(null);
    }, 500);
  });

  toast.style = Toast.Style.Success;
  toast.message = `Do Not Disturb is on for ${minutes} minutes`;

  await showHUD(`Start Do Not Disturb for ${minutes} minutes`);
}
