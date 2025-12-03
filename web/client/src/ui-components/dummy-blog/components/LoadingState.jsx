import React from "react";
import { Layout, Card, Box, BlockStack, Text } from "@shopify/polaris";


export const LoadingState = () => {
  return (
    <Layout>
      <Layout.Section>
        <Card sectioned>
          <Box paddingBlockStart="800" paddingBlockEnd="800" style={{ textAlign: "center" }}>
            <BlockStack gap="400" align="center">
              <Text variant="bodyMd" tone="subdued">
                Loading blog data...
              </Text>
            </BlockStack>
          </Box>
        </Card>
      </Layout.Section>
    </Layout>
  );
};

