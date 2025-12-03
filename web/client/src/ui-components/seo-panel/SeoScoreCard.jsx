import React from "react";
import { Card, Text, Button, BlockStack, InlineStack, Badge } from "@shopify/polaris";

const SeoScoreCard = ({ score = 40, critical = 6, good = 9, unknown = 13, lastScan = "Oct 14 2025, 3:17 pm" }) => {
  const getScoreColor = (score) => {
    if (score >= 70) return "#36B37E"; // green
    if (score >= 40) return "#FFAB00"; // orange
    return "#FF5630"; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return "good";
    if (score >= 40) return "medium";
    return "poor";
  };

  const circleColor = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <Card sectioned>
      <BlockStack align="center" gap="400" inlineAlign='center'>
        {/* Circular Progress */}
        <div style={{ position: "relative", width: "120px", height: "120px" }}>
          <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
            <path
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E0E0E0"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={circleColor}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "24px",
              fontWeight: 600,
            }}
          >
            {score}
          </div>
        </div>

        {/* Score Text */}
        <Text as="p" variant="bodyLg">
          Your score is{" "}
          <Text as="span" fontWeight="bold" color={label === "good" ? "success" : label === "medium" ? "warning" : "critical"}>
            {label}
          </Text>
        </Text>

        {/* Button */}
        {/* <Button size="medium" variant="primary">
          View checklist
        </Button> */}

        {/* Last Scan */}
        <Text as="p" tone="subdued" variant="bodySm">
          Last scan time: {lastScan}
        </Text>

        {/* Summary */}
        <BlockStack gap="200" align="center">
          <Text as="p" variant="bodyMd">
            Task to solve: {critical  + unknown}
          </Text>

          <BlockStack gap="300">
            <Badge tone="critical">{critical} critical issues</Badge>
            <Badge tone="success">{good} good results</Badge>
            <Badge tone="attention">{unknown} attention  needed</Badge>
          </BlockStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
};

export default SeoScoreCard;
