import React, { useContext, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BlockStack, Box, Button, Card, Divider, InlineStack, ProgressBar, Text } from "@shopify/polaris";
import { enableEditMode, closeSeoPanel, setSelectedBlogData } from "../../store/blogSlice";
import { useGetBlogByIdQuery, useUpdateArticleMutation } from "../../store/blogsApi";
import ShopContext from "../../utlis/ShopContext";
import { calculateSeoScore } from "../../utlis/calculateSeoScore";
import SeoItem from "./SeoItem";
import { SEO_CHEKS } from "../../utlis/constants";
import SeoScoreCard from "./SeoScoreCard";
import { useGetAllAssignAuthorQuery } from "../../store/snippetApi";

const SeoPanel_copy = () => {
  const dispatch = useDispatch();
  const shop = useContext(ShopContext);
  const [updateArticle, { isLoading }] = useUpdateArticleMutation({ shop });

  const { showSeoPanel, selectedBlogData } = useSelector(
    (state) => state.blog
  );
  // console.log("selectedBlogData", selectedBlogData);

  const seoChecks = SEO_CHEKS;
  const { refetch } = useGetBlogByIdQuery(
    { shop, id: selectedBlogData?.id },
    { skip: !selectedBlogData?.id }
  );

  // Assigned authors for the selected blog
  const { data: assignedAuthor, error: assignErr, isLoading: loadAssignAuth } = useGetAllAssignAuthorQuery({
    shop: shop,
    blogId: selectedBlogData?.blog?.id,
    articleId: selectedBlogData?.id,
  },
    { skip: !selectedBlogData?.id, refetchOnMountOrArgChange: true }
  );
  console.log("assignedAuthor", assignedAuthor);
  // Handle assigned authors safely
let assignedAuthors = {};

if (!loadAssignAuth && !assignErr && assignedAuthor?.authorsData) {
  assignedAuthors = assignedAuthor.authorsData;
} else {
  assignedAuthors = null;  
}

  const allAnalyses = useMemo(() => {
  if (!selectedBlogData) return [];
  return seoChecks.map((item) => {
    const value = item?.getValue(selectedBlogData);
    let analysis = item?.checkValue
      ? item.id === "author_bio"
        ? item.checkValue(value, selectedBlogData, assignedAuthors)
        : item.checkValue(value)
      : { status: "unknown", message: "" };
    return { id: item.id, status: analysis.status, message: analysis.message };
  });
}, [selectedBlogData, assignedAuthors]);



  const { score: overallScore, breakdown } = useMemo(() => {
  return calculateSeoScore(allAnalyses);
}, [allAnalyses]);

  // Count breakdown
  const critical = breakdown.filter((b) => b.status === "missing").length;
  const good = breakdown.filter((b) => b.status === "good").length;
  const unknown = breakdown.filter((b) => b.status === "warning").length;


  if (!showSeoPanel || !selectedBlogData) return null;


  const handleEdit = (fieldId) => {
    dispatch(enableEditMode(fieldId)); // triggers BlogEditor for this field
  };

  const handleFixLinks = () => {
    // Set edit mode in blog slice
    dispatch(enableEditMode("links_check"));
  };

  const handleFix = async (item) => {
    if (!item.isAutoFix) return;
    try {
      const fixedBlog = item.autoFix(selectedBlogData);
      // console.log("fixedBlog", fixedBlog);
      // return;

      const numericArticleId = selectedBlogData.id.split("/").pop();
      const numericBlogId = selectedBlogData.blog.id.split("/").pop();
      const formData = new FormData();
      formData.append("id", selectedBlogData?.id);
      formData.append("blog_id", selectedBlogData?.blog?.id);
      formData.append("body_html", fixedBlog?.body);
      // formData.append("body_html", dummyBlog);

      await updateArticle({ shop, formData }).unwrap();
      const { data: updatedBlog } = await refetch();
      dispatch(setSelectedBlogData(updatedBlog?.data));
    } catch (err) {
      console.error("Auto-fix failed", err);
    }
  };

  return (
    <div
      style={{
        // position: "fixed",
        // right: 0,
        // top: 0,
        // top: '0',
        width: "100%",
        height: "100vh",
        backgroundColor: "#fff",
        borderLeft: "1px solid #EDEDED",
        background: '#fff',
        padding: "1rem",
        overflowY: "auto",
        zIndex: 100,
      }}
    >
      <BlockStack gap={200} >
        <InlineStack align="space-between">
          <Text variant="headingMd">SEO Analyzer</Text>
          <Button plain onClick={() => dispatch(closeSeoPanel())}>
            Close
          </Button>
        </InlineStack>

        <Box padding='--p-space-300' />

        <div style={{ marginTop: "2rem", }}>
          <SeoScoreCard
            score={overallScore}
            critical={critical}
            good={good}
            unknown={unknown}
            lastScan={new Date().toLocaleString()}
          />
        </div>
        <Box padding='space.space40' />

        <BlockStack gap={200} >
          {seoChecks.map((item) => {
            const value = item?.getValue(selectedBlogData);
            // pass assignedAuthors only for author_bio
            let analysis = item?.checkValue
              ? item.id === "author_bio"
                ? item.checkValue(value, selectedBlogData,  assignedAuthors)
                : item.checkValue(value)
              : { status: "unknown", message: "" };
            return (
              <SeoItem
                key={item.id}
                item={{ ...item, value, analysis }}
                onEdit={() => dispatch(enableEditMode(item.id))}
                onFix={() => handleFix(item)}
                onFixLinks={item.id === "internal_links" || item.id === "external_links" ? handleFixLinks : null}
              />
            );
          })}
        </BlockStack>
      </BlockStack>
    </div>
  );
};

export default SeoPanel_copy;
