import { TextField } from "@shopify/polaris";

export const SEO_FORMS = {
  meta_title: ({ value, onChange }) => (
    <TextField
      label="Meta Title"
      value={value}
      onChange={onChange}
      placeholder="Enter SEO-friendly meta title"
      autoComplete="off"
    />
  ),
  meta_description: ({ value, onChange }) => (
    <TextField
      label="Meta Description"
      value={value}
      onChange={onChange}
      placeholder="Enter meta description..."
      multiline={3}
      autoComplete="off"
    />
  ),
  // future checks can define custom forms here
};
