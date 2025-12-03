// src/utlis/blogUtils.js
import { useUpdateArticleMutation } from "../store/blogsApi";

export const useUpdateBlog = () => {
  const [updateArticle] = useUpdateArticleMutation();

  const updateBlogData = async ({ shop, blogData }) => {
    if (!blogData?.id || !blogData?.blog?.id) throw new Error("Invalid blog data");

    // Extract numeric IDs from GID
    const numericArticleId = blogData.id.split("/").pop();
    const numericBlogId = blogData.blog.id.split("/").pop();

    const formData = new FormData();
    formData.append("id", numericArticleId);
    formData.append("blog_id", numericBlogId);
    formData.append("title", blogData.title || "");
    formData.append("body_html", blogData.body_html || "");
    formData.append("tags", blogData.tags || "");

    // Send to backend
    await updateArticle({ shop, formData }).unwrap();
  };

  return updateBlogData;
};
