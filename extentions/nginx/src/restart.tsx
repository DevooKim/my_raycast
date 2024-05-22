import { showHUD } from "@raycast/api";
import { execSync } from "child_process";
import { clearEnvCache, getEnv } from "./utils";

export default async function () {
  try {
    const start = performance.now();
    await showHUD(`Nginx restarted Started`);

    const options = await getEnv();

    execSync(`$SHELL -i -c "brew services restart nginx"`, options);

    await showHUD(`Nginx restarted Finished - ${((performance.now() - start) / 1000).toFixed(2)}s`);
  } catch (error) {
    if (error instanceof Error) {
      await showHUD(`Error: ${error.message}`);
    }

    clearEnvCache();
  }
}
