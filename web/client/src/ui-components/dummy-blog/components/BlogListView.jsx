import React from "react";
import { Layout, Card, DataTable, Button, Avatar, Text, Box, InlineStack, BlockStack } from "@shopify/polaris";
import { SeoScoreDisplay } from "./SeoScoreDisplay";


export const BlogListView = ({ blogData, seoScore, onViewDetails }) => {
  const tableRows = [
    [
      <InlineStack gap="400" blockAlign="center" wrap={false} key="title-inline">
        <Box>
          <Avatar source={blogData.image?.src} alt={blogData.title} size="md" />
        </Box>
        <span
          style={{
            textDecoration: "none",
            cursor: "pointer",
          }}
          onClick={onViewDetails}
        >
          <Text as="span" variant="bodyMd" tone="subdued" display="inline" fontWeight="semibold">
            {blogData.title}
          </Text>
        </span>
      </InlineStack>,
      <Text
        as="h3"
        variant="bodyMd"
        tone="subdued"
        maxWidth="220px"
        display="inline-block"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        truncate
      >
        Demo Blog
      </Text>,
      <SeoScoreDisplay score={seoScore} />,
      <Box style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Button variant="secondary" size="slim" onClick={onViewDetails}>
          View Details
        </Button>
      </Box>,
    ],
  ];

  return (
    <Layout>
      <Layout.Section>
        <Card sectioned>
          <InlineStack align="baseline" gap="200">
            <Text as="h2" variant="headingMd">
              Blog Optimization Demo
            </Text>
          </InlineStack>
          <Box paddingBlockStart="400">
            <Text variant="bodySm" tone="subdued">
              This is a demonstration screen showing how blog optimization analysis works.
              Click "View Details" to see the SEO score and recommendations for the dummy blog article.
            </Text>
          </Box>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <Card>
          <Box padding="400">
            <DataTable
              columnContentTypes={["text", "text", "text", "text"]}
              headings={["Article", "Blog Title", "SEO Score", "View SEO Issues"]}
              rows={tableRows}
              footerContent="Total articles: 1"
            />
          </Box>
        </Card>
      </Layout.Section>
    </Layout>
  );
};

