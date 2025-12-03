import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { getAppBridge } from "../bridge/appBridge";

export const authorizedBaseQuery = ({ baseUrl }) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: async (headers) => {
      const app = getAppBridge();
      if (app) {
        try {
          const token = await getSessionToken(app);
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }
        } catch (error) {
          console.warn("Failed to fetch session token", error);
        }
      }
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    return result;
  };
};
