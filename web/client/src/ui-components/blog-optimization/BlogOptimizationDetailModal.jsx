import React, { useMemo, useEffect, useState, useContext } from "react";
import { BlockStack, Box, InlineGrid, Text, Button, InlineStack } from "@shopify/polaris";
import { SEO_CHEKS } from "../../utlis/constants";
import { calculateSeoScore } from "../../utlis/calculateSeoScore";
import { analyzeImageAltTags } from "../../utlis/seoAnalysis";
import { analyzeSeoChecks } from "../../utlis/analyzeSeoChecks";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import ShopContext from "../../utlis/ShopContext";
import SeoScoreCard from "../seo-panel/SeoScoreCard";
import SeoItem from "../seo-panel/SeoItem";

const BlogOptimizationDetailModal = ({ article, assignedAuthor, onClose, onRefresh, modalId = "blog-optimization-modal" }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const shop = useContext(ShopContext);
  
  // Fetch all authors from authors management system
  const { data: authorsData } = useGetAllAuthorsQuery(shop, { skip: !shop });
  const allAuthorsFromManagement = authorsData?.data || [];
  
  // Use common SEO analysis function with all authors from management
  const allAnalyses = useMemo(() => {
    if (!article) return [];
    return analyzeSeoChecks(article, assignedAuthor || null, allAuthorsFromManagement);
  }, [article, assignedAuthor, allAuthorsFromManagement]);

  const { score, breakdown } = useMemo(() => {
    return calculateSeoScore(allAnalyses);
  }, [allAnalyses]);

  // Count breakdown - same as SeoPanel
  const critical = breakdown.filter((b) => b.status === "missing").length;
  const good = breakdown.filter((b) => b.status === "good").length;
  const unknown = breakdown.filter((b) => b.status === "warning").length;

  // Create extended SEO checks with image alt tags
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

  // Handle refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        // Force a small delay to ensure data is updated
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Error refreshing blog data:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Debug: Log when article changes
  // useEffect(() => {
  //   if (article) {
  //     console.log("Modal article updated:", {
  //       id: article.id,
  //       title: article.title,
  //       hasBody: !!article.body,
  //       metafieldsCount: article.metafields?.edges?.length || 0
  //     });
  //   }
  // }, [article]);
  
  // Open modal when component mounts and handle close event
  useEffect(() => {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Open modal
      if (modal.showOverlay) {
        modal.showOverlay();
      }

      // Handle close event
      const handleHide = () => {
        if (onClose) {
          onClose();
        }
      };
      modal.addEventListener("hide", handleHide);
      return () => {
        modal.removeEventListener("hide", handleHide);
      };
    }
  }, [modalId, onClose]);

  return (
    <s-modal id={modalId} heading="Blog SEO Optimization Details" size="large">
      <Box paddingBlockStart="400" paddingBlockEnd="400">
        {/* Info message about fixing blogs in Shopify admin */}
        <Box paddingBlockEnd="300">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="p" tone="subdued" variant="bodySm">
              To fix any blog issues found here, please make changes directly in your Shopify admin and then refresh to see updated analysis.
            </Text>
            {onRefresh && (
              <Button
                size="slim"
                variant="secondary"
                onClick={handleRefresh}
                loading={isRefreshing}
              >
                Refresh
              </Button>
            )}
          </InlineStack>
        </Box>
        <InlineGrid
          columns={{ xs: 1, md: "1fr 2fr" }}
          gap="600"
          justifyContent="center"
        >
          <Box >
            <SeoScoreCard
              score={score}
              critical={critical}
              good={good}
              unknown={unknown}
              lastScan={new Date().toLocaleString()}
            />
          </Box>
          <Box>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                SEO Checklist
              </Text>
              {extendedSeoChecks.map((item) => {
                const value = item?.getValue ? item.getValue(article) : "";
                // Use the analysis from allAnalyses (already calculated) instead of recalculating
                const analysisData = allAnalyses.find(a => a.id === item.id);
                const analysis = analysisData 
                  ? { status: analysisData.status, message: analysisData.message }
                  : { status: "missing", message: "" };

                return (
                  <SeoItem
                    key={item.id}
                    item={{ ...item, value, analysis }}
                    onEdit={() => { }}
                    onFix={() => { }}
                    onFixLinks={null}
                  />
                );
              })}
            </BlockStack>
          </Box>

        </InlineGrid>
        {/* <BlockStack gap="400">
        </BlockStack> */}
      </Box>

      {/* Close Button */}
      <s-button
        slot="secondary-actions"
        variant="secondary"
        commandFor={modalId}
        command="--hide"
        onClick={onClose}
      >
        Close
      </s-button>
    </s-modal>
  );
};

export default BlogOptimizationDetailModal;

