import { useRef, useState } from "react";
import axios from "axios";
import { Action, ActionPanel, Color, Detail, Grid, useNavigation } from "@raycast/api";
import { usePromise } from "@raycast/utils";

import { isValidCache, cachingData, getCachedData } from "../util/cache";
import { getWeekDays } from "../util/date";
import { processWeeklyMenuData } from "../util/menu";

import { CACHE_KEY, Menu, WeeklyMenu, dayOfWeekDescriptions } from "../types";

function MenuList() {
  const { push } = useNavigation();
  const [searchText, setSearchText] = useState("");

  const abortable = useRef<AbortController>();
  const { isLoading, data } = usePromise<(url: string) => Promise<WeeklyMenu>>(
    async (url: string) => {
      if (isValidCache(CACHE_KEY)) {
        const cachedData = getCachedData(CACHE_KEY);
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

  const searchedData = searchText
    ? weekdays.filter(
        (day) =>
          `${dayOfWeekDescriptions[day]}요일`.includes(searchText) ||
          data?.data[day]["2"].some((menu) => menu.name.includes(searchText)),
      )
    : weekdays;

  return (
    <Grid isLoading={isLoading} columns={3} onSearchTextChange={setSearchText}>
      {data &&
        searchedData.map((day) => {
          // 해당 날짜의 메뉴 중 검색어에 맞는 메뉴만 필터링
          const filteredMenus =
            searchText && !`${dayOfWeekDescriptions[day]}요일`.includes(searchText)
              ? data.data[day]["2"].filter((menu) => menu.name.includes(searchText))
              : data.data[day]["2"];

          return (
            <Grid.Section
              key={day}
              title={`${dayOfWeekDescriptions[day]}요일`}
              subtitle={`${filteredMenus.length}개의 메뉴`}
            >
              {filteredMenus.map((menu, mealMapIdx) => (
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
          );
        })}
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
