import { dayOfWeek } from "../types";

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
