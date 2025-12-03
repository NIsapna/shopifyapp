import React from "react";
import { BlockStack, InlineStack, Badge, ProgressBar, Icon, Text, Box } from "@shopify/polaris";
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";


const getScoreStatus = (score) => {
  if (score >= 70) {
    return {
      label: "Good",
      tone: "success",
      icon: CheckCircleIcon,
      progressColor: "success",
    };
  }
  if (score >= 40) {
    return {
      label: "Medium",
      tone: "attention",
      icon: AlertTriangleIcon,
      progressColor: "highlight",
    };
  }
  return {
    label: "Very Low",
    tone: "critical",
    icon: AlertCircleIcon,
    progressColor: "critical",
  };
};


export const SeoScoreDisplay = ({ score }) => {
  const status = getScoreStatus(score);

  return (
    <BlockStack gap="200">
      <InlineStack gap="100" align="start" blockAlign="center">
        <Icon source={status.icon} tone={status.tone} />
        <Badge tone={status.tone}>{status.label}</Badge>
        <Text variant="bodyMd" fontWeight="semibold" tone="subdued">
          {score}
        </Text>
      </InlineStack>
      <Box minWidth="100px" maxWidth="180px">
        <ProgressBar progress={score} size="small" tone={status.progressColor} />
      </Box>
    </BlockStack>
  );
};

