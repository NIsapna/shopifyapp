// src/components/BlogEditor.jsx
import { useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetBlogByIdQuery, useUpdateArticleMutation } from "../../store/blogsApi";
import { disableEditMode, setSelectedBlogData } from "../../store/blogSlice";
import ShopContext from "../../utlis/ShopContext";
import EditMetaDescriptionForm from "../forms/EditMetaDescriptionForm";
import EditMetaTitleForm from "../forms/EditMetaTitleForm";
import EditAuthorForm from "../forms/EditAuthorForm";
import { BlogEditorForm } from "../forms/BlogEditorForm";
import MainEditor from "../forms/MainEditor";
import { Banner, BlockStack, Text } from "@shopify/polaris";

const BlogEditor = () => {
  const dispatch = useDispatch();
  const shop = useContext(ShopContext);
  const { selectedBlogData, editMode, editField } = useSelector(
    (state) => state.blog
  );
  // console.log("BlogEditor render:", { editMode, editField, selectedBlogData });
  const [updateArticle, { isLoading }] = useUpdateArticleMutation({ shop });

  const { refetch } = useGetBlogByIdQuery(
    { shop, id: selectedBlogData?.id },
    { skip: !selectedBlogData?.id }
  );

  // 🔹 Local state for toast & error banner
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!selectedBlogData || !editMode) return null;

  const handleSave = async (_, formData) => {
    try {
      const res = await updateArticle({ shop, formData }).unwrap();
      console.log(res);
      if (res.success) {
        // Show Shopify toast after success
        const toastApi = window?.shopify?.toast;
        if (toastApi?.show) {
          await toastApi.show("Blog updated!", {
            duration: 2000,
          });
        }

        const { data: updatedBlog } = await refetch();
        dispatch(setSelectedBlogData(updatedBlog?.data));
        // dispatch(disableEditMode());
        setShowToast(true);
        setErrorMsg(""); // clear errors if any
      } else {
        // Show Shopify toast after error
        const toastApi = window?.shopify?.toast;
        if (toastApi?.show) {
          await toastApi.show(res.message || "Failed to update blog. Please try again.", {
            duration: 2000, isError: true
          });
        }
        setErrorMsg(res.message || "Failed to update blog. Please try again.");
      }
    } catch (err) {
      console.error("Update failed", err);
      setErrorMsg(err?.data?.message || "Server error! Please try later.");
    }
  };


  const renderEditor = () => {
    switch (editField) {
      case "all_fields":
        return (
          <MainEditor
            blog={selectedBlogData}
            onSave={handleSave}
            isLoading={isLoading}
            fields={["meta_title", "meta_description", "heading_tags", "internal_links", "external_links", "author_bio"]}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
          />
        );
      default:
        return null;
      // case "meta_title":
      //   return (
      //     <EditMetaTitleForm
      //       blog={selectedBlogData}
      //       onSave={handleSave}
      //       isLoading={isLoading}
      //     />
      //   );
      // case "meta_description":
      //   return (
      //     <EditMetaDescriptionForm
      //       blog={selectedBlogData}
      //       onSave={handleSave}
      //       isLoading={isLoading}
      //     />
      //   );
      // case "heading_tags":
      //   return (
      //     <BlogEditorForm
      //       blog={selectedBlogData}
      //       onSave={handleSave}
      //       isLoading={isLoading}
      //     />
      //   );
      // case "internal_links":
      //   return (
      //     <BlogEditorForm
      //       blog={selectedBlogData}
      //       onSave={handleSave}
      //       isLoading={isLoading}
      //     />
      //   );
      // case "external_links":
      //   return (
      //     <BlogEditorForm
      //       blog={selectedBlogData}
      //       onSave={handleSave}
      //       isLoading={isLoading}
      //     />
      //   );
      // case "author_bio":
      //   return (
      //     <EditAuthorForm
      //       blog={selectedBlogData}
      //       onSave={handleSave}
      //       isLoading={isLoading}
      //       authors={[]}
      //     />
      //   );
      // default:

    }
  };

  return (
    <>
      {renderEditor()}

    </>
  );
}

export default BlogEditor;
