/**
 * Common function to analyze SEO checks for a blog article
 * This ensures consistency across all components that need SEO analysis
 * 
 * @param {Object} articleData - The blog/article data to analyze
 * @param {Object} assignedAuthors - Optional assigned authors data (legacy support)
 * @param {Array} allAuthorsFromManagement - All authors from authors management system
 * @returns {Array} Array of analysis results with id, status, and message
 */
import { SEO_CHEKS } from "./constants";
import { analyzeImageAltTags } from "./seoAnalysis";

export const analyzeSeoChecks = (articleData, assignedAuthors = null, allAuthorsFromManagement = []) => {
  if (!articleData) return [];

  // Analyze all SEO checks from constants
  const analyses = SEO_CHEKS.map((item) => {
    const value = item?.getValue ? item.getValue(articleData) : "";
    let analysis = { status: "unknown", message: "" };

    if (item?.checkValue) {
      // Special handling for author_bio - needs articleData, assignedAuthors (legacy), and allAuthorsFromManagement
      if (item.id === "author_bio") {
        analysis = item.checkValue(value, articleData, assignedAuthors, allAuthorsFromManagement);
      } else {
        // All other checks only need the value
        analysis = item.checkValue(value);
      }
    }

    return {
      id: item.id,
      status: analysis.status,
      message: analysis.message,
    };
  });

  // Add image alt tags check (7th check)
  const imageAnalysis = analyzeImageAltTags(articleData?.body || "");
  analyses.push({
    id: "image_alt_tags",
    status: imageAnalysis.status,
    message: imageAnalysis.message,
  });

  return analyses;
};

