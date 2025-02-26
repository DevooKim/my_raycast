
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
            const menuArray = data.data[day as dayOfWeek][meal as mealType];
            mealAcc[meal as mealType] =
              menuArray.length === 0
                ? [{ mealIdx: 0, name: "메뉴 없음", side: "", kcal: 0, thumbnailUrl: "", corner: "" }]
                : menuArray.map(filterMenu);
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


