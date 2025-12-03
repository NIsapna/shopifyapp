import { useMemo } from "react";
import { calculateSeoScore } from "../../../utlis/calculateSeoScore";
import { analyzeSeoChecks } from "../../../utlis/analyzeSeoChecks";
import { SEO_CHEKS } from "../../../utlis/constants";
import { analyzeImageAltTags } from "../../../utlis/seoAnalysis";


export const useSeoAnalysis = (blogData) => {
  // Calculate SEO analyses
  const seoAnalyses = useMemo(() => {
    if (!blogData) return [];
    return analyzeSeoChecks(blogData, null, []);
  }, [blogData]);

  // Calculate overall score
  const { score: overallScore, breakdown } = useMemo(() => {
    return calculateSeoScore(seoAnalyses);
  }, [seoAnalyses]);

  // Count breakdown by status
  const { critical, good, unknown } = useMemo(() => {
    return {
      critical: breakdown.filter((b) => b.status === "missing").length,
      good: breakdown.filter((b) => b.status === "good").length,
      unknown: breakdown.filter((b) => b.status === "warning").length,
    };
  }, [breakdown]);

  // Create extended SEO checks with image alt tags
  const extendedSeoChecks = useMemo(() => {
    const checks = [...SEO_CHEKS];
    checks.push({
      id: "image_alt_tags",
      title: "Image Alt Tags",
      description: "Add descriptive alt text to all images for better accessibility and SEO.",
      getValue: (blog) => blog?.body || "",
      checkValue: analyzeImageAltTags,
    });
    return checks;
  }, []);

  // Get analysis for each check item
  const checkAnalyses = useMemo(() => {
    if (!blogData) return [];

    return extendedSeoChecks.map((item) => {
      const value = item?.getValue(blogData);
      let analysis = { status: "unknown", message: "" };

      if (item?.checkValue) {
        analysis =
          item.id === "author_bio"
            ? item.checkValue(value, blogData, null, [])
            : item.checkValue(value);
      }

      // Find analysis from seoAnalyses for consistency
      const analysisData = seoAnalyses.find((a) => a.id === item.id);
      const finalAnalysis = analysisData
        ? { status: analysisData.status, message: analysisData.message }
        : analysis;

      return {
        ...item,
        value,
        analysis: finalAnalysis,
      };
    });
  }, [extendedSeoChecks, seoAnalyses, blogData]);

  return {
    overallScore,
    critical,
    good,
    unknown,
    checkAnalyses,
    lastScan: new Date().toLocaleString(),
  };
};

