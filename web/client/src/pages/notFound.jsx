import { Page, Text } from "@shopify/polaris";

export default function NotFound() {
  return (
    <Page title="Page Not Found" >
      <Text as="h1" variant="headingLg">
        404 - Page Not Found
      </Text>
      <Text as="p">
        Sorry, the page you are looking for doesn’t exist or has been moved.
      </Text>
    </Page>
  );
}
