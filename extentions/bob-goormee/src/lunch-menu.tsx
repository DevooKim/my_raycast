import { useRef } from "react";
import axios from "axios";
import { Action, ActionPanel, Color, Detail, Grid, useNavigation } from "@raycast/api";
import { usePromise } from "@raycast/utils";

import { isValidCache, cachingData, getCachedData } from "../util/cache";
import { getWeekDays } from "../util/date";
import { processWeeklyMenuData } from "../util/menu";

import { CACHE_KEY, Menu, WeeklyMenu, dayOfWeekDescriptions } from "../types";

function MenuList() {
  const { push } = useNavigation();

  const abortable = useRef<AbortController>();
  const { isLoading, data } = usePromise<(url: string) => Promise<WeeklyMenu>>(
    async (url: string) => {
      if (isValidCache(CACHE_KEY)) {
        const cachedData = getCachedData(CACHE_KEY);ƒ
        if (cachedData) {
          return cachedData;
        }
      }

      const { data: fetchData } = await axios.get<WeeklyMenu>(url, {
        signal: abortable.current?.signal,
      });

      if (!fetchData) {
        throw new Error("No data found");
      }

      const result = processWeeklyMenuData(fetchData);

      cachingData(CACHE_KEY, result);
      return result;
    },
    ["https://front.cjfreshmeal.co.kr/meal/v1/week-meal?storeIdx=6057&weekType=1"],
    {
      abortable,
    },
  );

  const weekdays = getWeekDays();

  return (
    <Grid isLoading={isLoading} columns={3}>
      {data &&
        weekdays.map((day, dayMapIdx) => (
          <Grid.Section
            key={day}
            title={dayMapIdx === 0 ? `${dayOfWeekDescriptions[day]}요일 (오늘)` : `${dayOfWeekDescriptions[day]}요일`}
            subtitle={`${data.data[day]["2"].length}개의 메뉴`}
          >
            {data.data[day]["2"].map((menu, mealMapIdx) => (
              <Grid.Item
                key={`${day}-lunch-${mealMapIdx}`}
                content={menu.thumbnailUrl || ""}
                title={menu.name}
                subtitle={menu.corner}
                actions={
                  <ActionPanel>
                    <Action
                      title="메뉴 상세"
                      onAction={() => push(<SideMenu day={`${dayOfWeekDescriptions[day]}요일`} menu={menu} />)}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </Grid.Section>
        ))}
    </Grid>
  );
}

function SideMenu({ day, menu }: { day: string; menu: Menu }) {
  const { pop } = useNavigation();

  const markdown = `
  ![${menu.name}](${menu.thumbnailUrl})
  `;

  return (
    <Detail
      markdown={markdown}
      navigationTitle={`${day} - ${menu.corner} - ${menu.name}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="🤔 코너" text={menu.corner} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title={"🥄 메인 메뉴"} text={{ value: menu.name, color: Color.PrimaryText }} />
          <Detail.Metadata.TagList title="🍴 사이드 메뉴">
            {menu.side.split(",").map((side, idx) => (
              <Detail.Metadata.TagList.Item key={idx} text={side} />
            ))}
          </Detail.Metadata.TagList>
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="🏃‍➡️ 칼로리" text={`${menu.kcal}kcal`} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action title="메뉴 목록" onAction={pop} />
        </ActionPanel>
      }
    />
  );
}

export default function Command() {
  return <MenuList />;
}
