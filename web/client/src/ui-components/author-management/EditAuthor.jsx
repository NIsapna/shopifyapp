import React, { useState, useEffect } from "react";
import {
  Modal,
  TextField,
  BlockStack,
  DropZone,
  Text,
  Spinner,
  InlineError,
  Box,
} from "@shopify/polaris";
import {
  useGetAuthorByIdQuery,
  useUpdateAuthorMutation,
} from "../../store/authorApi";

// Minimum and maximum length for bio (like AddAuthorForm)
const MIN_BIO_LENGTH = 30;
const MAX_BIO_LENGTH = 900;

// Image size and dimension constants
const MIN_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB in bytes
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB in bytes
const MIN_IMAGE_WIDTH = 150;
const MIN_IMAGE_HEIGHT = 150;

// Utility to check image validity by mime
const isValidImage = (file) => {
  if (!file) return false;
  // Accept only basic image types (PNG/JPG/JPEG/GIF/SVG/WebP)
  return [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/svg+xml",
    "image/webp",
  ].includes(file.type);
};

// Utility to check image dimensions (returns a promise)
const checkImageDimensions = (file) => {
  return new Promise((resolve) => {
    // Skip dimension check for SVG files
    if (file.type === "image/svg+xml") {
      resolve({ valid: true });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const valid = img.width >= MIN_IMAGE_WIDTH && img.height >= MIN_IMAGE_HEIGHT;
      resolve({
        valid,
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false });
    };

    img.src = objectUrl;
  });
};

// Strict URL validator: must start with http:// or https:// and be a valid URL
function isValidUrl(url) {
  if (!url || !url.trim()) return false;
  try {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) return false;
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

// Email validation (simple but standard RFC2822)
function isValidEmail(email) {
  // Slightly robust email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function EditAuthor({ authorId, onClose }) {
  const { data, isLoading: loadingAuthor } = useGetAuthorByIdQuery(authorId);
  const author = data?.data || {};

  const [updateAuthor, { isLoading: updating }] = useUpdateAuthorMutation();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    email: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(""); // For any overall error

  // Prefill form when author data is loaded
  useEffect(() => {
    if (author) {
      setForm({
        name: author?.name || "",
        bio: author?.bio || "",
        email: author?.email || "",
        linkedin: author?.linkedin || "",
        twitter: author?.twitter || "",
        instagram: author?.instagram || "",
      });
    }
  }, [author]);

  const handleChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setGlobalError("");
  };

  const handleDrop = async (files) => {
    const file = files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      setErrors((prev) => ({ ...prev, image: "Please upload an image." }));
      return;
    }
    if (!isValidImage(file)) {
      setImageFile(null);
      setImagePreview(null);
      setErrors((prev) => ({
        ...prev,
        image: "Upload a valid image file (PNG, JPG, JPEG, GIF, WEBP, SVG).",
      }));
      return;
    }

    // Validate file size (3-4 MB)
    const fileSize = file.size;
    if (fileSize < MIN_IMAGE_SIZE) {
      setImageFile(null);
      setImagePreview(null);
      setErrors((prev) => ({
        ...prev,
        image: `Image size must be at least ${MIN_IMAGE_SIZE / (1024 * 1024)} MB.`,
      }));
      return;
    }
    if (fileSize > MAX_IMAGE_SIZE) {
      setImageFile(null);
      setImagePreview(null);
      setErrors((prev) => ({
        ...prev,
        image: `Image size must not exceed ${MAX_IMAGE_SIZE / (1024 * 1024)} MB.`,
      }));
      return;
    }

    // Validate image dimensions (150x150 minimum)
    const dimensionCheck = await checkImageDimensions(file);
    if (!dimensionCheck.valid) {
      setImageFile(null);
      setImagePreview(null);
      if (dimensionCheck.width && dimensionCheck.height) {
        setErrors((prev) => ({
          ...prev,
          image: `Image dimensions must be at least ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels. Current: ${dimensionCheck.width}x${dimensionCheck.height} pixels.`,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          image: `Image dimensions must be at least ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels.`,
        }));
      }
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = async () => {
    const newErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = "This field is required.";
      } else if (key === "email" && value.trim()) {
        if (!isValidEmail(value.trim())) {
          newErrors.email = "Enter a valid email address.";
        }
      } else if (
        (key === "linkedin" || key === "twitter" || key === "instagram") &&
        value.trim()
      ) {
        if (!isValidUrl(value.trim())) {
          newErrors[key] = "Enter a valid URL (must start with http:// or https://)";
        }
      } else if (key === "bio") {
        const bioLength = value.trim().length;
        if (bioLength < MIN_BIO_LENGTH) {
          newErrors.bio = `Bio must be at least ${MIN_BIO_LENGTH} characters.`;
        } else if (bioLength > MAX_BIO_LENGTH) {
          newErrors.bio = `Bio should not exceed ${MAX_BIO_LENGTH} characters.`;
        }
      }
    });

    // Image validation
    if (!imageFile && !author?.image) {
      newErrors.image = "Please upload an image.";
    } else if (imageFile) {
      // Validate file type
      if (!isValidImage(imageFile)) {
        newErrors.image = "Upload a valid image file (PNG, JPG, JPEG, GIF, WEBP, SVG).";
      } else {
        // Validate file size (3-4 MB)
        const fileSize = imageFile.size;
        if (fileSize < MIN_IMAGE_SIZE) {
          newErrors.image = `Image size must be at least ${MIN_IMAGE_SIZE / (1024 * 1024)} MB.`;
        } else if (fileSize > MAX_IMAGE_SIZE) {
          newErrors.image = `Image size must not exceed ${MAX_IMAGE_SIZE / (1024 * 1024)} MB.`;
        } else {
          // Validate image dimensions (150x150 minimum)
          const dimensionCheck = await checkImageDimensions(imageFile);
          if (!dimensionCheck.valid) {
            if (dimensionCheck.width && dimensionCheck.height) {
              newErrors.image = `Image dimensions must be at least ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels. Current: ${dimensionCheck.width}x${dimensionCheck.height} pixels.`;
            } else {
              newErrors.image = `Image dimensions must be at least ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels.`;
            }
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Improved submit with strict URL check and global error
  const handleSubmit = async () => {
    setGlobalError("");
    if (!(await validateForm())) {
      setGlobalError("Please fix the errors above before updating.");
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append("image", imageFile);

    try {
      await updateAuthor({ authorId, formData }).unwrap();
      const toastApi = window?.shopify?.toast;
      if (toastApi?.show) {
        await toastApi.show("Author details updated!", {
          duration: 2000,
        });
      }
      onClose(); // close modal after success
    } catch (err) {
      setGlobalError(
        err?.data?.message || "There was an error updating the author. Please try again."
      );
    }
  };

  if (loadingAuthor)
    return <Spinner accessibilityLabel="Loading author..." />;

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Author"
      primaryAction={{
        content: "Update",
        onAction: handleSubmit,
        loading: updating,
      }}
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap={200}>
          <TextField
            label="Name"
            value={form.name}
            onChange={handleChange("name")}
            requiredIndicator
            error={errors.name}
            disabled={author?.is_defaut_author}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={handleChange("email")}
            requiredIndicator
            error={errors.email}
            type="email"
          />
          <TextField
            label="Bio"
            value={form.bio}
            onChange={handleChange("bio")}
            multiline={4}
            requiredIndicator
            error={errors.bio}
            helpText={`Bio should be ${MIN_BIO_LENGTH}-${MAX_BIO_LENGTH} characters.`}
            maxLength={MAX_BIO_LENGTH}
          />
          <TextField
            label="LinkedIn"
            value={form.linkedin}
            onChange={handleChange("linkedin")}
            requiredIndicator
            error={errors.linkedin}
            autoComplete="url"
            placeholder="https://linkedin.com/in/username"
            helpText="URL must start with http:// or https://"
          />
          <TextField
            label="Twitter"
            value={form.twitter}
            onChange={handleChange("twitter")}
            requiredIndicator
            error={errors.twitter}
            autoComplete="url"
            placeholder="https://twitter.com/username"
            helpText="URL must start with http:// or https://"
          />
          <TextField
            label="Instagram"
            value={form.instagram}
            onChange={handleChange("instagram")}
            requiredIndicator
            error={errors.instagram}
            autoComplete="url"
            placeholder="https://instagram.com/username"
            helpText="URL must start with http:// or https://"
          />

          <DropZone
            label="Profile picture"
            accept="image/*"
            type="image"
            onDrop={handleDrop}
          >
            <DropZone.FileUpload />
            {imageFile ? (
              <Box paddingBlockStart="2">
                <Text>{imageFile.name}</Text>
                {imagePreview && (
                  <Box paddingBlockStart="2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "120px",
                        maxHeight: "120px",
                        borderRadius: "100%",
                        objectFit: "cover",
                        border: "1px solid #ccc",
                        marginTop: "8px",
                      }}
                    />
                  </Box>
                )}
              </Box>
            ) : (
              author?.image && (
                <Box paddingBlockStart="2">
                  <img
                    src={`${import.meta.env.VITE_HOST}/${author.image}`}
                    alt="Current author"
                    style={{
                      maxWidth: "120px",
                      maxHeight: "120px",
                      borderRadius: "100%",
                      objectFit: "cover",
                      border: "1px solid #ccc",
                      marginTop: "8px",
                    }}
                  />
                </Box>
              )
            )}
          </DropZone>
          <Box paddingBlockStart="200">
            <Text variant="bodySm" tone="subdued">
              Image requirements: Size between {MIN_IMAGE_SIZE / (1024 * 1024)}-{MAX_IMAGE_SIZE / (1024 * 1024)} MB, minimum dimensions {MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT} pixels.
            </Text>
          </Box>
          {errors.image && (
            <InlineError message={errors.image} fieldID="image" />
          )}

          {globalError && (
            <Text color="critical" as="p">
              {globalError}
            </Text>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
