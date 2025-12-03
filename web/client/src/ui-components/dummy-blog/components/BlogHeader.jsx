import React from "react";
import { Card, InlineGrid, BlockStack, Text, InlineStack, Button } from "@shopify/polaris";


export const BlogHeader = ({ title, editMode, onEdit, onCancel, onSave, onBack }) => {
  return (
    <Card>
      <InlineGrid columns="1fr auto" gap="400" align="center" justifyContent="space-between">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd">
            {editMode ? "Edit Blog" : "Blog SEO Analysis"}
          </Text>
          <Text tone="subdued" variant="bodyMd">
            Blog Title: {title || ""}
          </Text>
        </BlockStack>
        <InlineStack gap="200">
          {editMode ? (
            <>
              <Button onClick={onCancel}>Cancel</Button>
              <Button variant="primary" onClick={onSave}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onEdit}>Edit Mode</Button>
              <Button onClick={onBack}>Back</Button>
            </>
          )}
        </InlineStack>
      </InlineGrid>
    </Card>
  );
};

