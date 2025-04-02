import { Cache } from "@raycast/api";
import { tryCatch } from "./try-catch";

const cache = new Cache();
const getExpiredKey = (key: string) => `${key}-expired`;

export const CACHE_KEY = {
  SCHEDULE: "schedule",
};

export const clearCache = () => {
  cache.clear();
};

export const removeCache = (key: string) => {
  cache.remove(key);
  cache.remove(getExpiredKey(key));
};

export const isStaleCache = (key: string) => {
  const expiredKey = getExpiredKey(key);
  const expiredTime = cache.get(expiredKey);

  if (!expiredTime) return true;

  const now = new Date().getTime();

  return now > parseInt(expiredTime);
};

export const getCache = <T = string>(key: string): T | null => {
  const stale = isStaleCache(key);
  const cachedData = cache.get(key);

  if (stale) {
    removeCache(key);
    return null;
  }

  if (cachedData && !stale) {
    const { data } = tryCatch<T>(() => JSON.parse(cachedData));

    if (data) {
      return data;
    }

    return cachedData as T;
  }
  return null;
};

export const setCacheForNextMinute = (key: string, value: string) => {
  const scheduleData = JSON.parse(value);

  // scheduleData.updatedAt의 그 다음 1분 00초
  const nextMinute = new Date(scheduleData.updatedAt);
  nextMinute.setMinutes(nextMinute.getMinutes() + 1);
  nextMinute.setSeconds(0);

  const expiredKey = getExpiredKey(key);

  cache.set(expiredKey, nextMinute.getTime().toString());
  cache.set(key, value);
};
