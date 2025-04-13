import { useCachedPromise } from "@raycast/utils";
import { useRef } from "react";
import { getCustomerInfo } from "../fetches/getCustomerInfo";
import { getCache, isStaleCache, CACHE_KEY, clearCache, setCacheForNextHour } from "../utils/cache";
import { AuthError } from "../errors/AuthError";
import { getCookie, removeCookie } from "../utils/cookie";

const CUSTOMER_ID = "pVEkBrmzMB";

export default function useGetIsValidCookie() {
  const abortable = useRef<AbortController>(null);

  const result = useCachedPromise(
    async (): Promise<{ valid: boolean; requestedAt: number }> => {
      const cookie = await getCookie();

      const cachedData = getCache<{ valid: boolean; requestedAt: number }>(CACHE_KEY.IS_VALID_COOKIE);
      if (cachedData) {
        return cachedData;
      }

      const response = await getCustomerInfo({ customerId: CUSTOMER_ID, cookie });

      return {
        valid: response,
        requestedAt: Date.now(),
      };
    },
    [],
    {
      abortable,
      onData: async (data) => {
        if (isStaleCache(CACHE_KEY.IS_VALID_COOKIE)) {
          setCacheForNextHour({
            key: CACHE_KEY.IS_VALID_COOKIE,
            value: JSON.stringify(data),
            validHours: 6,
          });
        }
      },
      onError: async (error) => {
        if (error instanceof AuthError) {
          clearCache();
          await removeCookie();
        }
      },
    },
  );

  return result;
}
