import { Cache } from "@raycast/api";

export const isValidCache = (cacheKey: string): boolean => {
  const now = new Date();
  const cache = new Cache();
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    const data = JSON.parse(cachedData);
    const lastFetchDate = new Date(data.date);

    // 오늘 오전 6시를 기준으로 설정
    const todaySixAM = new Date(now);
    todaySixAM.setHours(6, 0, 0, 0);

    // 마지막 업데이트가 오늘 오전 6시 이후라면 캐시된 데이터 사용
    if (lastFetchDate >= todaySixAM) {
      return true;
    }
  }

  return false;
};

export const cachingData = (cacheKey: string, data: WeeklyMenu) => {
  const cache = new Cache();
  cache.set(cacheKey, JSON.stringify(data));
  return true;
};

export const getCachedData = (cacheKey: string): WeeklyMenu | null => {
  const cache = new Cache();
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    const data = JSON.parse(cachedData);
    return data.data;
  }

  return null;
};
