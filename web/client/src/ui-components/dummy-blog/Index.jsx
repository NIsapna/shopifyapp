import React, { useState, useCallback } from "react";
import { Layout } from "@shopify/polaris";
import { useDispatch, useSelector } from "react-redux";
import { updateBlog } from "../../store/dummyBlogSlice";
import { useDummyBlogForm } from "./hooks/useDummyBlogForm";
import { useSeoAnalysis } from "./hooks/useSeoAnalysis";
import { LoadingState } from "./components/LoadingState";
import { BlogListView } from "./components/BlogListView";
import { BlogHeader } from "./components/BlogHeader";
import { BlogEditForm } from "./components/BlogEditForm";
import { BlogDetailView } from "./components/BlogDetailView";


const DummyBlogScreen = () => {
  const dispatch = useDispatch();
  const blogData = useSelector((state) => state.dummyBlog.blogData);

  const [showDetails, setShowDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Custom hooks for form and SEO analysis
  const formState = useDummyBlogForm(blogData, editMode);
  const seoData = useSeoAnalysis(blogData);

  // Handlers with useCallback for performance
  const handleViewDetails = useCallback(() => {
    setShowDetails(true);
  }, []);

  const handleBack = useCallback(() => {
    setShowDetails(false);
    setEditMode(false);
  }, []);

  const handleEdit = useCallback(() => {
    setEditMode(true);
  }, []);

  const handleCancel = useCallback(() => {
    setEditMode(false);
    formState.resetForm();
  }, [formState]);

  const handleSave = useCallback(() => {
    dispatch(
      updateBlog({
        title: formState.title,
        metaTitle: formState.metaTitle,
        metaDescription: formState.metaDescription,
        body: formState.bodyHtml,
        imageUrl: formState.imageUrl,
      })
    );
    setEditMode(false);
  }, [dispatch, formState]);

  const handleImageError = useCallback((e) => {
    e.target.style.display = "none";
  }, []);

  // Loading state
  if (!blogData) {
    return <LoadingState />;
  }

  // List view
  if (!showDetails) {
    return (
      <BlogListView
        blogData={blogData}
        seoScore={seoData.overallScore}
        onViewDetails={handleViewDetails}
      />
    );
  }

  // Detail/Edit view
  return (
    <Layout>
      <Layout.Section>
        <BlogHeader
          title={blogData.title}
          editMode={editMode}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onBack={handleBack}
        />
      </Layout.Section>

      <Layout.Section>
        {editMode ? (
          <BlogEditForm formState={formState} onImageError={handleImageError} />
        ) : (
          <BlogDetailView seoData={seoData} />
        )}
      </Layout.Section>
    </Layout>
  );
};

export default DummyBlogScreen;
