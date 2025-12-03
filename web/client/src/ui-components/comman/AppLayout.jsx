// src/components/layouts/AppLayout.jsx
import React from "react";
import { Frame, Loading } from "@shopify/polaris";
import { usePlan } from "../../context/PlanContext";
import NoPlanLayout from "./NoPlanLayout";

export default function AppLayout({ children }) {
  const { planName, isPlanActive, isLoading } = usePlan();

  if (isLoading) return <Loading />;

  // 🧩 If no active plan, block all access
  if (!isPlanActive || planName === "free") {
    return <NoPlanLayout />;
  }

  // Otherwise render the app
  return <Frame>{children}</Frame>;
}
