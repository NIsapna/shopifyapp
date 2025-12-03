import { useContext, useMemo } from "react";
import ShopContext from "../utlis/ShopContext";
import { useGetActivePlanQuery } from "../store/pricingApi";

export default function useActivePlan() {
  const shop = useContext(ShopContext);
  const { data, isLoading, isError } = useGetActivePlanQuery({ shop });

  console.log(data)
  const plan = useMemo(() => {
    const planData = data?.data;

    const noPlanSelected =
      !planData ||
      (Array.isArray(planData) && planData.length === 0) ||
      (typeof planData === "object" && Object.keys(planData).length === 0);

    // Handle array and object responses safely
    const planName = Array.isArray(planData) && planData.length === 0
      ? "free"
      : planData?.planName || "free";

    const isActive = planData?.status === "ACTIVE";
    const expiresAt = planData?.expiresAt || null;

    return { name: planName, isActive, expiresAt, noPlanSelected };
  }, [data]);

  return {
    plan,
    isLoading,
    isError,
  };
}
