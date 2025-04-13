import { Cache } from "@raycast/api";
import { tryCatch } from "./try-catch";
import { utcDayjs } from "./dayjs.timezone";

const cache = new Cache();
const getExpiredKey = (key: string) => `${key}-expired`;

export const CACHE_KEY = {
  SUMMARY: "summary",
  TIME_OFF: "time-off", // TIME_OFF 캐시 키 추가
  ATTRIBUTES: "attributesCache",
  STATUS: "statusCache",
  IS_VALID_COOKIE: "isValidCookie",
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

export const setCacheForNextMinute = ({
  key,
  value,
  validMinutes = 1,
  timestamp,
}: {
  key: string;
  value: string;
  validMinutes?: number;
  timestamp?: number;
}) => {
  const timestampValue = utcDayjs(timestamp).valueOf();

  const nextMinute = utcDayjs(timestampValue).add(validMinutes, "minute").startOf("minute").valueOf();

  const expiredKey = getExpiredKey(key);

  cache.set(expiredKey, nextMinute.toString());
  cache.set(key, value);
};

export const setCacheForNextHour = ({
  key,
  value,
  validHours = 1,
  timestamp,
}: {
  key: string;
  value: string;
  validHours?: number;
  timestamp?: number;
}) => {
  const timestampValue = utcDayjs(timestamp).valueOf();

  const nextHour = utcDayjs(timestampValue).add(validHours, "hour").startOf("hour").valueOf();

  const expiredKey = getExpiredKey(key);

  cache.set(expiredKey, nextHour.toString());
  cache.set(key, value);
};

export const setCacheForNextDay = ({
  key,
  value,
  validDays = 1,
  timestamp,
}: {
  key: string;
  value: string;
  validDays?: number;
  timestamp?: number;
}) => {
  const timestampValue = utcDayjs(timestamp).valueOf();

  const nextDay = utcDayjs(timestampValue).add(validDays, "day").startOf("day").valueOf();

  const expiredKey = getExpiredKey(key);

  cache.set(expiredKey, nextDay.toString());
  cache.set(key, value);
};
