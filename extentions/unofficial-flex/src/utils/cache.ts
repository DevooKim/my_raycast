import { Cache, environment } from "@raycast/api";
import { tryCatch } from "./try-catch";
import { utcDayjs } from "./dayjs.timezone";

const cache = new Cache();
const getExpiredKey = (key: string) => `${key}-expired`;

export const CACHE_KEY = {
  SUMMARY: "summary",
  TIME_OFF: "time-off", // TIME_OFF 캐시 키 추가
  ATTRIBUTES: "attributesCache",
  STATUS: "statusCache",
} as const;

export const clearCache = () => {
  cache.clear();
};

export const removeCache = (key: string) => {
  cache.remove(key);
  cache.remove(getExpiredKey(key));
};

export const isStaleCache = (key: string) => {
  const expiredKey = getExpiredKey(key);
  const expiredValue = cache.get(expiredKey);

  if (!expiredValue) return true;

  const now = utcDayjs();
  const expiredTime = utcDayjs(parseInt(expiredValue));

  return now.isAfter(expiredTime);
};

export const getCache = <T = string>(key: string): T | null => {
  const stale = isStaleCache(key);
  const cachedData = cache.get(key);

  if (environment.isDevelopment) {
    return null;
  }

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

export const setCacheForNextMinute = (key: string, value: string, _timestamp?: number) => {
  const timestamp = utcDayjs(_timestamp).valueOf();

  const nextMinute = utcDayjs(timestamp).add(1, "minute").startOf("minute").valueOf();

  const expiredKey = getExpiredKey(key);

  cache.set(expiredKey, nextMinute.toString());
  cache.set(key, value);
};

export const setCacheForNextDay = (key: string, value: string, _timestamp?: number) => {
  const timestamp = utcDayjs(_timestamp).valueOf();

  const nextDay = utcDayjs(timestamp).add(1, "day").startOf("day").valueOf();

  const expiredKey = getExpiredKey(key);

  cache.set(expiredKey, nextDay.toString());
  cache.set(key, value);
};
