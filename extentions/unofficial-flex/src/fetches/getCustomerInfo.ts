import { AuthError } from "../errors/AuthError";

export const getCustomerInfo = async ({ customerId, cookie }: { customerId: string; cookie: string }) => {
  const url = `https://flex.team/api/v2/core/customers/${customerId}/info`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Cookie: `AID=${cookie}`,
    },
  });

  if (response.status === 401) {
    throw new AuthError();
  }

  return response.ok;
};
