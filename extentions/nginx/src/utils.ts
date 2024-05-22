import { Cache } from "@raycast/api";
import { shellEnv } from "shell-env";

const CACHE_KEY = "nginx_shell_env";

type CacheData = {
  env: {
    PATH: string;
  };
  cwd: string;
  shell: string;

  [key: string]: unknown;
};

const cache = new Cache();

export async function getEnv(): Promise<CacheData> {
  const cachedData = cache.get(CACHE_KEY);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const env = await shellEnv();

  const result = {
    env: {
      PATH: env.PATH,
    },
    cwd: env.HOME || `/Users/${process.env.USER}`,
    shell: env.SHELL,
  } as CacheData;

  cache.set(CACHE_KEY, JSON.stringify(result));

  return result;
}

export function clearEnvCache() {
  cache.remove(CACHE_KEY);
}