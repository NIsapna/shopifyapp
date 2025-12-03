import React, { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { BlockStack, Box, Text, InlineStack } from "@shopify/polaris";
import { calculateSeoScore } from "../../utlis/calculateSeoScore";
import SeoItem from "../seo-panel/SeoItem";
import { SEO_CHEKS } from "../../utlis/constants";
import { useGetAllAssignAuthorQuery } from "../../store/snippetApi";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import { analyzeImageAltTags } from "../../utlis/seoAnalysis";
import { analyzeSeoChecks } from "../../utlis/analyzeSeoChecks";
import ShopContext from "../../utlis/ShopContext";

const ReadOnlySeoPanel = () => {
  const shop = useContext(ShopContext);
  const { selectedBlogData } = useSelector((state) => state.blog);

  // Fetch all authors from authors management system
  const { data: authorsData } = useGetAllAuthorsQuery(shop, { skip: !shop });
  const allAuthorsFromManagement = authorsData?.data || [];

  // Assigned authors for the selected blog (legacy support)
  const { data: assignedAuthor, error: assignErr, isLoading: loadAssignAuth } = useGetAllAssignAuthorQuery({
    shop: shop,
    blogId: selectedBlogData?.blog?.id,
    articleId: selectedBlogData?.id,
  },
    { skip: !selectedBlogData?.id, refetchOnMountOrArgChange: true }
  );

  // Handle assigned authors safely
  let assignedAuthors = null;
  if (!loadAssignAuth && !assignErr && assignedAuthor?.authorsData) {
    assignedAuthors = assignedAuthor.authorsData;
  }

  // Create extended SEO checks with image alt tags for display
  const extendedSeoChecks = useMemo(() => {
    const checks = [...SEO_CHEKS];
    // Add image alt tags as a check item
    checks.push({
      id: "image_alt_tags",
      title: "Image Alt Tags",
      description: "Add descriptive alt text to all images for better accessibility and SEO.",
      getValue: (blog) => blog?.body || "",
      checkValue: analyzeImageAltTags,
    });
    return checks;
  }, []);

  // Use common SEO analysis function with all authors from management
  const allAnalyses = useMemo(() => {
    if (!selectedBlogData) return [];
    return analyzeSeoChecks(selectedBlogData, assignedAuthors, allAuthorsFromManagement);
  }, [selectedBlogData, assignedAuthors, allAuthorsFromManagement]);

  const { score: overallScore, breakdown } = useMemo(() => {
    return calculateSeoScore(allAnalyses);
  }, [allAnalyses]);

  // Count breakdown
  const critical = breakdown.filter((b) => b.status === "missing").length;
  const good = breakdown.filter((b) => b.status === "good").length;
  const unknown = breakdown.filter((b) => b.status === "warning").length;

  if (!selectedBlogData) return null;

  return (
    <div>
      <BlockStack gap={200}>
        <InlineStack align="space-between">
          <Text variant="headingMd">SEO Checklist</Text>
        </InlineStack>

        <Box padding="--p-space-300" />

        <BlockStack gap={200}>
          {extendedSeoChecks.map((item) => {
            const value = item?.getValue(selectedBlogData);
            // pass assignedAuthors only for author_bio
            let analysis = item?.checkValue
              ? item.id === "author_bio"
                ? item.checkValue(value, selectedBlogData, assignedAuthors)
                : item.checkValue(value)
              : { status: "unknown", message: "" };
            
            // Find analysis from allAnalyses for consistency
            const analysisData = allAnalyses.find(a => a.id === item.id);
            const finalAnalysis = analysisData 
              ? { status: analysisData.status, message: analysisData.message }
              : analysis;

            return (
              <SeoItem
                key={item.id}
                item={{ ...item, value, analysis: finalAnalysis }}
                onEdit={() => {}} // No-op for read-only
                onFix={() => {}} // No-op for read-only
                onFixLinks={null} // No-op for read-only
              />
            );
          })}
        </BlockStack>
      </BlockStack>
    </div>
  );
};


export default ReadOnlySeoPanel;

