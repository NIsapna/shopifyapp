import { useState, useEffect, useCallback } from "react";


export const useDummyBlogForm = (blogData, editMode) => {
  const [title, setTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [metaTitleCount, setMetaTitleCount] = useState(0);
  const [metaDescriptionCount, setMetaDescriptionCount] = useState(0);

  // Helper to extract metafield value
  const getMetafieldValue = useCallback((key) => {
    return blogData?.metafields?.edges?.find((e) => e.node.key === key)?.node.value || "";
  }, [blogData]);

  // Initialize form from Redux state
  useEffect(() => {
    if (!blogData) return;

    setTitle(blogData.title || "");
    setMetaTitle(getMetafieldValue("metaTitle"));
    setMetaDescription(getMetafieldValue("metaDescription"));
    setBodyHtml(blogData.body || "");
    setImageUrl(blogData.image?.src || "");
    setMetaTitleCount(getMetafieldValue("metaTitle").length);
    setMetaDescriptionCount(getMetafieldValue("metaDescription").length);
  }, [blogData, getMetafieldValue]);

  // Reset form when entering edit mode
  useEffect(() => {
    if (editMode && blogData) {
      setTitle(blogData.title || "");
      setMetaTitle(getMetafieldValue("metaTitle"));
      setMetaDescription(getMetafieldValue("metaDescription"));
      setBodyHtml(blogData.body || "");
      setImageUrl(blogData.image?.src || "");
      setMetaTitleCount(getMetafieldValue("metaTitle").length);
      setMetaDescriptionCount(getMetafieldValue("metaDescription").length);
    }
  }, [editMode, blogData, getMetafieldValue]);

  const handleMetaTitleChange = useCallback((val) => {
    setMetaTitle(val);
    setMetaTitleCount(val.length);
  }, []);

  const handleMetaDescriptionChange = useCallback((val) => {
    setMetaDescription(val);
    setMetaDescriptionCount(val.length);
  }, []);

  const handleBodyChange = useCallback((value) => {
    setBodyHtml(value);
  }, []);

  const resetForm = useCallback(() => {
    if (blogData) {
      setTitle(blogData.title || "");
      setMetaTitle(getMetafieldValue("metaTitle"));
      setMetaDescription(getMetafieldValue("metaDescription"));
      setBodyHtml(blogData.body || "");
      setImageUrl(blogData.image?.src || "");
    }
  }, [blogData, getMetafieldValue]);

  return {
    // Form values
    title,
    metaTitle,
    metaDescription,
    bodyHtml,
    imageUrl,
    metaTitleCount,
    metaDescriptionCount,
    // Setters
    setTitle,
    setImageUrl,
    // Handlers
    handleMetaTitleChange,
    handleMetaDescriptionChange,
    handleBodyChange,
    resetForm,
  };
};

