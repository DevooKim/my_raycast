import { Cache } from "@raycast/api";

import { DailyMenu, dayOfWeek, mealType, Menu, WeeklyMenu } from "../types";

// 필터링된 주간 메뉴 데이터를 생성하는 함수
export const processWeeklyMenuData = (data: WeeklyMenu): WeeklyMenu => {
  // 파라미터 menu는 Menu타입보다 더 많은 키가 있어서 필요한 키만 추출해서 반환하는 함수
  const filterMenu = (menu: Menu): Menu => ({
    mealIdx: menu.mealIdx,
    name: menu.name,
    side: menu.side,
    kcal: menu.kcal,
    thumbnailUrl: menu.thumbnailUrl,
    corner: menu.corner,
  });

  return {
    status: data.status,
    date: data.date,
    data: Object.keys(data.data).reduce(
      (acc, day) => {
        acc[day as dayOfWeek] = Object.keys(data.data[day as dayOfWeek] as DailyMenu).reduce(
          (mealAcc, meal) => {
            mealAcc[meal as mealType] = data.data[day as dayOfWeek][meal as mealType].map(filterMenu);
            return mealAcc;
          },
          {} as { [key in mealType]: Menu[] },
        );
        return acc;
      },
      {} as { [key in dayOfWeek]: { [key in mealType]: Menu[] } },
    ),
  };
};

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

export const getWeekDays = (): dayOfWeek[] => {
  const weekDays: dayOfWeek[] = ["mo", "tu", "we", "th", "fr"];

  // 오늘의 요일 인덱스 (0: 일요일, 1: 월요일, ..., 6: 토요일)
  const today = new Date().getDay();

  // 만약 오늘이 주말(0: 일요일 또는 6: 토요일)이면 기본 순서 반환
  if (today === 0 || today === 6) {
    return weekDays;
  }

  // 오늘 요일의 인덱스를 weekDays 배열의 인덱스로 변환 (1 → 0, 2 → 1, ...)
  const todayIndex = today - 1;

  // 오늘부터 금요일까지, 그 다음 월요일부터 어제까지의 순서로 재구성
  return [...weekDays.slice(todayIndex), ...weekDays.slice(0, todayIndex)];
};
