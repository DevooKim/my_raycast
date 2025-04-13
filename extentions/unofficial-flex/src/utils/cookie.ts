import { LocalStorage } from "@raycast/api";
import { AuthError } from "../errors/AuthError";

export const COOKIE_KEY = "cookie";

export const getCookie = async () => {
  const cookie = await LocalStorage.getItem<string>(COOKIE_KEY);

  if (!cookie) {
    throw new AuthError();
  }

  return cookie;
};

export const setCookie = async (cookie: string) => {
  await LocalStorage.setItem(COOKIE_KEY, cookie);
};
export const removeCookie = async () => {
  await LocalStorage.removeItem(COOKIE_KEY);
};
