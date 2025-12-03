import React, { createContext, useContext, useMemo } from "react";
import { useGetActivePlanQuery } from "../store/pricingApi";
import ShopContext from "../utlis/ShopContext";

const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
  const shop = useContext(ShopContext);
  const { data, isLoading, isError } = useGetActivePlanQuery({ shop });

  const value = useMemo(() => {
    const planData = data?.data || [];

    const noPlanSelected =
      !planData ||
      (Array.isArray(planData) && planData.length === 0) ||
      (typeof planData === "object" && Object.keys(planData).length === 0);

    const planName =
      Array.isArray(planData) && planData.length === 0
        ? ""
        : planData?.planName || "";

    const isPlanActive = planData?.status === "ACTIVE";
    const expiresAt = planData?.expiresAt || null;
    const is_install = planData?.is_install || false;
    const isPlanExpired = planData?.status === "EXPIRED";
    const isPlanCancelled = planData?.status === "CANCELLED";
    const isPlanPending = planData?.status === "PENDING";
    return {
      planName,
      isPlanActive,
      expiresAt,
      isLoading,
      isError,
      noPlanSelected,
      is_install,
      isPlanExpired,
      isPlanPending,
      blogCount: planData?.blogCount || 0,
    };
  }, [data, isLoading, isError]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlan = () => useContext(PlanContext);
