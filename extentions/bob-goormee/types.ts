export const CACHE_KEY = "weeklyMenu";

export type dayOfWeek = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";
export type dayOfWeekKor = "월" | "화" | "수" | "목" | "금" | "토" | "일";
export const dayOfWeekDescriptions: { [key in dayOfWeek]: string } = {
  mo: "월",
  tu: "화",
  we: "수",
  th: "목",
  fr: "금",
  sa: "토",
  su: "일",
};

export type mealType = "1" | "2" | "3";
export type mealTypeKor = "아침" | "점심" | "저녁";
export const mealTypeDescriptions: { [key in mealType]: string } = {
  "1": "아침",
  "2": "점심",
  "3": "저녁",
};

export interface Menu {
  mealIdx: number;
  name: string;
  side: string;
  kcal: number;
  thumbnailUrl: string;
  corner: string;
}

export type DailyMenu = { [key in mealType]: Menu[] };

export interface WeeklyMenu {
  status: string;
  date: string;
  data: {
    [key in dayOfWeek]: DailyMenu;
  };
}
