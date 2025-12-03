import React from "react";
import {
  Card,
  Box,
  BlockStack,
  TextField,
  Text,
} from "@shopify/polaris";
import { RichTextEditor } from "../../text-editor/RichTextEditor";
import "../../forms/rich-text-editor.css";

const RICH_TEXT_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
  ],
};


export const BlogEditForm = ({ formState, onImageError }) => {
  const {
    title,
    metaTitle,
    metaDescription,
    bodyHtml,
    imageUrl,
    metaTitleCount,
    metaDescriptionCount,
    setTitle,
    setImageUrl,
    handleMetaTitleChange,
    handleMetaDescriptionChange,
    handleBodyChange,
  } = formState;

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="500">
          {/* Title */}
          <TextField
            label="Blog Title"
            value={title}
            onChange={setTitle}
            placeholder="Enter blog title"
          />

          {/* Featured Image URL */}
          <TextField
            label="Featured Image URL"
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="https://example.com/image.jpg"
            helpText="Enter a URL for the featured image"
          />
          {imageUrl && (
            <Box paddingBlockStart="200">
              <img
                src={imageUrl}
                alt="Preview"
                style={{
                  maxWidth: "300px",
                  maxHeight: "200px",
                  objectFit: "contain",
                  border: "1px solid #e1e3e5",
                  borderRadius: "4px",
                }}
                onError={onImageError}
              />
            </Box>
          )}

          {/* Meta Title */}
          <BlockStack gap="100">
            <TextField
              label="Meta Title"
              value={metaTitle}
              onChange={handleMetaTitleChange}
              placeholder="Write a clear, keyword-rich title"
              multiline={3}
            />
            <BlockStack gap="025" align="space-between" inline>
              <Text tone="subdued">Suggested: up to 60 characters</Text>
              <Text tone="subdued" as="span" variant="bodySm">
                {metaTitleCount} / 60
              </Text>
            </BlockStack>
          </BlockStack>

          {/* Meta Description */}
          <BlockStack gap="100">
            <TextField
              label="Meta Description"
              value={metaDescription}
              onChange={handleMetaDescriptionChange}
              placeholder="Write a concise summary that describes your blog post."
              multiline={6}
            />
            <BlockStack gap="025" align="space-between" inline>
              <Text tone="subdued">Suggested: up to 160 characters</Text>
              <Text tone="subdued" as="span" variant="bodySm">
                {metaDescriptionCount} / 160
              </Text>
            </BlockStack>
          </BlockStack>

          {/* Body HTML */}
          <div className="PolarisRichEditor">
            <RichTextEditor
              label="Blog Content"
              placeholder="Enter your blog content..."
              onChange={handleBodyChange}
              value={bodyHtml || ""}
              modules={RICH_TEXT_MODULES}
            />
          </div>
        </BlockStack>
      </Box>
    </Card>
  );
};

