import React, { useState, useEffect } from "react";
import { Card, TextField, Button, BlockStack, Text } from "@shopify/polaris";
import { getMetafieldValue } from "../../utlis/helper";

export default function EditMetaDescriptionForm({ blog, onSave, isLoading }) {
  const [value, setValue] = useState(blog?.body_html || "");

  useEffect(() => {
    if (blog) {
      const metaValue = getMetafieldValue(blog, 'metaDescription')
      setValue(metaValue || "");
    }
  }, [blog]);

  const handleSave = () => {
    // The backend expects the key name `body_html`
    onSave("metaDescription", value);
  };

  return (
    <Card sectioned>
      <BlockStack gap="300">
        <Text variant="headingSm">Edit Meta Description</Text>

        <TextField
          label="Meta Description"
          value={value}
          onChange={setValue}
          placeholder="Write a concise summary that describes your blog post."
          multiline={4}
          autoComplete="off"
        />

        <Text tone="subdued" as="p">
          Keep it between 120–160 characters for best SEO results.
        </Text>

        <Button primary loading={isLoading} onClick={handleSave}>
          Save
        </Button>
      </BlockStack>
    </Card>
  );
}
