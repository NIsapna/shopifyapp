import React, { useState, useCallback, useMemo } from "react";
import {
  Page,
  Layout,
  Card,
  DropZone,
  Thumbnail,
  Button,
  Text,
  BlockStack,
  TextField,
  InlineStack,
  Banner,
  Divider,
  Box,
} from "@shopify/polaris";

const initialState = {
  name: "",
  bio: "",
  email: "",
  imageUrl: "",
  twitter: "",
  linkedin: "",
  instagram: "",
  file: null,
};

export default function ProfileForm() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = useCallback((field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDrop = useCallback((_, acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setForm((prev) => ({
        ...prev,
        file: acceptedFiles[0],
        imageUrl: window.URL.createObjectURL(acceptedFiles[0]),
      }));
    }
  }, []);

  const uploaded = useMemo(
    () =>
      form.file ? (
        <Thumbnail
          size="large"
          alt={form.file.name}
          source={window.URL.createObjectURL(form.file)}
        />
      ) : null,
    [form.file]
  );
const BASE_URL = import.meta.env.VITE_HOST;
// const API_ALL_AUTHORS = `${BASE_URL}/api/GetAllProfile`;
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setSubmitting(true);
      setMessage(null);

      try {
        const payload = {
          name: form.name,
          bio: form.bio,
          email: form.email,
          image: form.imageUrl,
          social: {
            linkedin: form.linkedin,
            twitter: form.twitter,
            instagram: form.instagram,
          },
        };

        const resp = await fetch(`${BASE_URL}/api/CreateProfile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || "Request failed");
        setMessage({ type: "success", text: "Profile saved successfully" });
        setForm(initialState);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Failed to save profile" });
      } finally {
        setSubmitting(false);
      }
    },
    [form]
  );

  return (
    <Page title="Author Profile" fullWidth>
      <Layout>
        <Layout.Section>
          <Box
            as="form"
            onSubmit={handleSubmit}
            maxWidth="800px"
            paddingBlock="400"
          >
            <BlockStack gap="600">
         
              {/* Profile Image Section */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Profile Image
                  </Text>
                  <DropZone accept="image/*" type="image" onDrop={handleDrop}>
                    <BlockStack gap="200" align="center">
                      {uploaded}
                      {!form.file && <DropZone.FileUpload />}
                    </BlockStack>
                  </DropZone>
                  <TextField
                    label="Image URL"
                    value={form.imageUrl}
                    onChange={handleChange("imageUrl")}
                    placeholder="https://example.com/image.jpg"
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>

              {/* Basic Info */}
              <Card>
                <BlockStack gap="400">
                  <TextField
                    label="Full Name"
                    value={form.name}
                    onChange={handleChange("name")}
                    autoComplete="off"
                    requiredIndicator
                  />

                  <TextField
                    label="Bio"
                    value={form.bio}
                    onChange={handleChange("bio")}
                    autoComplete="off"
                    multiline={4}
                  />

                  <TextField
                    label="Email"
                    value={form.email}
                    onChange={handleChange("email")}
                    type="email"
                    requiredIndicator
                    placeholder="your@email.com"
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>

              {/* Social Links */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Social Links
                  </Text>
                  <Divider />
                  <TextField
                    label="Twitter"
                    value={form.twitter}
                    onChange={handleChange("twitter")}
                    placeholder="https://twitter.com/username"
                    autoComplete="off"
                  />
                  <TextField
                    label="LinkedIn"
                    value={form.linkedin}
                    onChange={handleChange("linkedin")}
                    placeholder="https://linkedin.com/in/username"
                    autoComplete="off"
                  />
                  <TextField
                    label="Instagram"
                    value={form.instagram}
                    onChange={handleChange("instagram")}
                    placeholder="https://instagram.com/username"
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>

              {/* Save button aligned right */}
              <InlineStack align="end">
                <Button variant="primary" submit loading={submitting}>
                  Save Profile
                </Button>
              </InlineStack>
            </BlockStack>
                 {message && (
                <Banner tone={message.type === "error" ? "critical" : "success"}>
                  {message.text}
                </Banner>
              )}

          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
