// src/components/BlogEditor/EditMetaTitleForm.jsx
import React, { useState, useEffect } from "react";
import { Card, TextField, Button, BlockStack, Text } from "@shopify/polaris";
import { getMetafieldValue } from "../../utlis/helper";

export default function EditMetaTitleForm({ blog, onSave, isLoading }) {
  const [value, setValue] = useState(blog?.title || "");

  useEffect(() => {
    if (blog) {
      const metaValue = getMetafieldValue(blog, 'metaTitle')
      setValue(metaValue || "");  
    }
  }, [blog]);

  const handleSave = () => {
    onSave("metaTitle", value);
  };

  return (
    <Card sectioned>
      <BlockStack gap="300">
        <Text variant="headingSm">Edit Meta Title</Text>
        <TextField
          label="Meta Title"
          value={value}
          onChange={setValue}
          placeholder="Write a clear, keyword-rich title"
        />
        <Button primary loading={isLoading} onClick={handleSave}>
          Save
        </Button>
      </BlockStack>
    </Card>
  );
}
