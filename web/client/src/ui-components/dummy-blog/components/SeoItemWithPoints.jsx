import React from "react";
import { Card, Text, BlockStack, Box, Icon, InlineStack, Badge } from "@shopify/polaris";
import {
  AlertTriangleIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "@shopify/polaris-icons";

export const SeoItemWithPoints = ({ item }) => {
  const { value, analysis, pointsEarned, maxPoints } = item;

  return (
    <Card sectioned>
      <BlockStack gap="100">
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap="100">
            <Text variant="headingSm">{item.title}</Text>
            <Text variant="bodySm" tone="subdued">
              {item.description}
            </Text>
          </BlockStack>
          {pointsEarned !== undefined && maxPoints !== undefined && (
            <Badge tone={analysis?.status === "good" ? "success" : analysis?.status === "warning" ? "attention" : "critical"}>
              {pointsEarned.toFixed(1)} / {maxPoints.toFixed(1)} pts
            </Badge>
          )}
        </InlineStack>

        <Box
          style={{
            // marginTop: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Box>
            {analysis?.status === "good" ? (
              <Icon source={CheckCircleIcon} tone="success" />
            ) : analysis?.status === "warning" ? (
              <Icon source={AlertTriangleIcon} tone="caution" />
            ) : (
              <Icon source={AlertCircleIcon} tone="critical" />
            )}
          </Box>
          <Text
            tone={
              analysis?.status === "good"
                ? "success"
                : analysis?.status === "warning"
                  ? "caution"
                  : "critical"
            }
            variant="bodyMd"
          >
            {analysis?.message}
          </Text>
        </Box>
      </BlockStack>
    </Card>
  );
};

