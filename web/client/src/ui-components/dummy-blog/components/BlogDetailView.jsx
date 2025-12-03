import React from "react";
import { Box, InlineGrid, BlockStack, Card, Text, InlineStack } from "@shopify/polaris";
import SeoScoreCard from "../../seo-panel/SeoScoreCard";
import { SeoItemWithPoints } from "./SeoItemWithPoints";


export const BlogDetailView = ({ seoData }) => {
  const { overallScore, critical, good, unknown, checkAnalyses, lastScan } = seoData;

  return (
    <Box>
      <InlineGrid gap="600" columns={{ xs: 1, md: "1fr 1.5fr" }}>
        {/* Left column: SEO Score Card */}
        <Box>
          <BlockStack gap="500">
            <Card>
              <Box padding="400">
                <SeoScoreCard
                  score={overallScore}
                  critical={critical}
                  good={good}
                  unknown={unknown}
                  lastScan={lastScan}
                />
              </Box>
            </Card>
          </BlockStack>
        </Box>

        {/* Right column: SEO Checklist */}
        <Box>
          <Card>
            <Box padding="100">
              <BlockStack gap={200}>
                <InlineStack align="space-between">
                  <Text variant="headingMd">SEO Checklist</Text>
                </InlineStack>

                <Box padding="--p-space-200" />

                <Box
                  style={{
                    maxHeight: "calc(100vh - 280px)",
                    overflowY: "auto",
                    paddingRight: "8px",
                  }}
                >
                  <BlockStack gap={200}>
                    {checkAnalyses.map((item) => (
                      <SeoItemWithPoints key={item.id} item={item} />
                    ))}
                  </BlockStack>
                </Box>
              </BlockStack>
            </Box>
          </Card>
        </Box>
      </InlineGrid>
    </Box>
  );
};

