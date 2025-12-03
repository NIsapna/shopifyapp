import React from "react";
import {
  Frame,
  Navigation,
  Page,
  Card,
  Text,
  ProgressBar,
  BlockStack,
  Box,
  Icon,
  Button,
  Layout,
} from "@shopify/polaris";
import {
  HomeIcon,
} from "@shopify/polaris-icons";

const DashboardPage = () => {
  // Sample improvement list
  const improvements = [
    { title: "Use Clear H1 Titles", status: "good" },
    { title: "Optimize Meta Tags", status: "bad" },
    { title: "Add Product Links", status: "bad" },
    { title: "Use Author Bio", status: "bad" },
    { title: "Add FAQs Section", status: "good" },
    { title: "Include Product Images", status: "bad" },
    { title: "Use Outbound Links", status: "bad" },
    { title: 'Add "Add to Cart" Buttons', status: "good" },
    { title: "Improve Page Speed", status: "good" },
  ];

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            url: "#",
            label: "Documentation",
          },
          {
            url: "#",
            label: "Components",
          },
          {
            url: "#",
            label: "UI Kit",
          },
          {
            url: "#",
            label: "Playground",
          },
        ]}
      />
    </Navigation>
  );

  const topBarMarkup = (
    <Box
      background="bg-surface"
      borderBlockEndWidth="1"
      // borderColor="border-subdued"
      padding="3"
      display="flex"
      alignItems="center"
      gap="2"
    >
      <Icon source={HomeIcon} tone="base" />
      <Text as="h2" variant="headingMd">
        App name
      </Text>
    </Box>
  );

  const scoreSection = (
    <Card sectioned>
      <BlockStack gap="3">
        <Text as="h3" variant="headingMd">
          Score
        </Text>
        <Text variant="bodySm" tone="subdued">
          We know you can do better!
        </Text>
        <ProgressBar progress={0} size="small" />
        <BlockStack gap="2" style={{ marginTop: "1rem" }}>
          {improvements.map((item, i) => (
            <Card key={i} padding="3">
              <BlockStack gap="1">
                <Box display="flex" alignItems="center" gap="2">
                  {/* <Icon
                    source={
                      item.status === "good" ? CircleTickMajor : CircleCancelMajor
                    }
                    tone={item.status === "good" ? "success" : "critical"}
                  /> */}
                  <Text as="p" fontWeight="medium">
                    {item.title}
                  </Text>
                </Box>
                <Button plain tone="accent">
                  Update
                </Button>
              </BlockStack>
            </Card>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );

  return (
    <Frame topBar={topBarMarkup} navigation={navigationMarkup}>
      <Page fullWidth>
        <Layout>
          <Layout.Section>
            <Box
              background="bg-surface-secondary"
              minHeight="70vh"
              borderRadius="2"
              // borderColor="border-subdued"
              padding="6"
            >
              <Text alignment="center" tone="subdued">
                Main Content Area
              </Text>
            </Box>
          </Layout.Section>

          <Layout.Section secondary>{scoreSection}</Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
};

export default DashboardPage;
