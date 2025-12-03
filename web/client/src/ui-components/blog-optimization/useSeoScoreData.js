import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import ShopContext from "../../utlis/ShopContext";
import { useGetAllAssignAuthorQuery } from "../../store/snippetApi";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import { calculateSeoScore } from "../../utlis/calculateSeoScore";
import { analyzeSeoChecks } from "../../utlis/analyzeSeoChecks";

export const useSeoScoreData = () => {
  const shop = useContext(ShopContext);
  const { selectedBlogData } = useSelector((state) => state.blog);

  // Fetch all authors from authors management system
  const { data: authorsData } = useGetAllAuthorsQuery(shop, { skip: !shop });
  const allAuthorsFromManagement = authorsData?.data || [];

  const { data: assignedAuthor, error: assignErr, isLoading: loadAssignAuth } = useGetAllAssignAuthorQuery({
    shop: shop,
    blogId: selectedBlogData?.blog?.id,
    articleId: selectedBlogData?.id,
  },
    { skip: !selectedBlogData?.id, refetchOnMountOrArgChange: true }
  );

  let assignedAuthors = null;
  if (!loadAssignAuth && !assignErr && assignedAuthor?.authorsData) {
    assignedAuthors = assignedAuthor.authorsData;
  }

  // Use common SEO analysis function with all authors from management
  const allAnalyses = useMemo(() => {
    if (!selectedBlogData) return [];
    return analyzeSeoChecks(selectedBlogData, assignedAuthors, allAuthorsFromManagement);
  }, [selectedBlogData, assignedAuthors, allAuthorsFromManagement]);

  const { score: overallScore, breakdown } = useMemo(() => {
    return calculateSeoScore(allAnalyses);
  }, [allAnalyses]);

  const critical = breakdown.filter((b) => b.status === "missing").length;
  const good = breakdown.filter((b) => b.status === "good").length;
  const unknown = breakdown.filter((b) => b.status === "warning").length;

  // Return default values when no blog is selected
  if (!selectedBlogData) {
    return {
      score: 0,
      critical: 0,
      good: 0,
      unknown: 0,
      lastScan: new Date().toLocaleString(),
    };
  }

  return {
    score: overallScore,
    critical,
    good,
    unknown,
    lastScan: new Date().toLocaleString(),
  };
};

