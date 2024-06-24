import { LocalStorage } from "@raycast/api";

const KEY = "browser-refresh-presets";

export type Preset = {
  mode: string;
  name: string;
  keyword?: string;
};

export const clearStorage = async () => {
  await LocalStorage.clear();
};

export const getStorage = async (): Promise<Preset[]> => {
  const data = await LocalStorage.getItem<string>(KEY);
  return data ? JSON.parse(data) : [];
};

export const setStorage = async (preset: Preset) => {
  const data = await getStorage();
  data.push(preset);

  await LocalStorage.setItem(KEY, JSON.stringify(data));
};

export const removeItem = async (index: number) => {
  const data = await getStorage();
  data.splice(index, 1);

  await LocalStorage.setItem(KEY, JSON.stringify(data));
};
