// src/store/pricingApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "./baseQuery";

const API_HOST = import.meta.env.VITE_HOST || "";

export const pricingApi = createApi({
  reducerPath: "pricingApi",
  baseQuery: authorizedBaseQuery({
    baseUrl: `${API_HOST}/api`,
  }),
  tagTypes: ["pricingPlan"],
  endpoints: (builder) => ({
    selectPlan: builder.mutation({
      query: (body) => ({
        url: "/billing/subscribe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["pricingPlan"],
    }),
    getActivePlan: builder.query({
      query: ({ shop, blogId, articleId }) => ({
        url: `/billing/getActivePlan?shop=${shop}`,
        method: "GET",
      }),
      providesTags: ["pricingPlan"],
    }),
  }),
});

export const { useSelectPlanMutation, useGetActivePlanQuery  } = pricingApi;
// /billing/getActivePlan?shop=sacsa