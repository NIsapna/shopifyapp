// SeoResultCard.jsx
import { Card, Text, Badge, InlineStack, Icon } from "@shopify/polaris";
import { CheckCircleIcon, AlertCircleIcon } from "@shopify/polaris-icons";

export const SeoResultCard = ({ label, result, status }) => {
  const icon = status === "success" ? CheckCircleIcon : AlertCircleIcon;

  return (
    <Card>
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="headingMd" as="h3">{label}</Text>
        <Icon source={icon} tone={status === "success" ? "success" : "critical"} />
      </InlineStack>

      {result.message && (
        <Text as="p" tone="subdued">{result.message}</Text>
      )}

      {result.summary && (
        <Badge tone="info">{result.summary}</Badge>
      )}
    </Card>
  );
};
