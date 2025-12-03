// src/components/comman/NoPlanOverlay.jsx
import React from "react";
import { Banner, Button, Text } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";

export default function NoPlanOverlay({ message }) {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-md z-30">
      <div className="max-w-md w-full p-6">
        <Banner
          tone="warning"
          title="No active plan found"
          status="critical"
        >
          <Text as="p" tone="subdued">
            {message ||
              "You currently don’t have an active plan. Please subscribe to continue using the app."}
          </Text>
          <div style={{ marginTop: "1rem" }}>
            <Button primary onClick={() => navigate("/pricing")}>
              Get a Plan
            </Button>
          </div>
        </Banner>
      </div>
    </div>
  );
}
