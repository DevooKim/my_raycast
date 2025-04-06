const WORK_HOURS_PER_DAY = 8;
const HOURS_TO_MINUTES = 60;

export const minutesToHourString = (minutes: number): string => {
  const hours = Math.floor(minutes / HOURS_TO_MINUTES);
  const remainingMinutes = minutes % HOURS_TO_MINUTES;

  if (hours === 0) {
    return `${remainingMinutes}분`;
  }

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
};

/**
 * 8시간을 1일로 치환
 * 나머지는 시간, 분으로 표시
 * 일, 시간, 분이 0일 경우 표시하지 않음
 */

export const minutesToDayString = (minutes: number): string => {
  const days = Math.floor(minutes / (HOURS_TO_MINUTES * WORK_HOURS_PER_DAY));
  const remainingMinutes = minutes % (HOURS_TO_MINUTES * WORK_HOURS_PER_DAY);
  const hours = Math.floor(remainingMinutes / HOURS_TO_MINUTES);
  const finalMinutes = remainingMinutes % HOURS_TO_MINUTES;

  let result = "";

  if (days > 0) {
    result += `${days}일`;
  }

  if (hours > 0) {
    if (result) result += " ";
    result += `${hours}시간`;
  }

  if (finalMinutes > 0) {
    if (result) result += " ";
    result += `${finalMinutes}분`;
  }

  // 모든 단위가 0인 경우 "0분" 반환
  return result || "0분";
};
