import React, { useState, useContext, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  Layout,
  EmptyState,
  DataTable,
  Button,
  Avatar,
  Spinner,
  Text,
  Box,
  Pagination,
  InlineGrid,
  BlockStack,
  InlineStack,
  Banner,
  Badge,
  ProgressBar,
  Icon,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";
import { useDispatch, useSelector } from "react-redux";
import ShopContext from "../../utlis/ShopContext";
import { useGetBlogsQuery } from "../../store/blogsApi";
import { selectBlog, clearSelectedBlog, setSelectedBlogData } from "../../store/blogSlice";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import ReadOnlySeoPanel from "./ReadOnlySeoPanel";
import { useSeoScoreData } from "./useSeoScoreData";
import SeoScoreCard from "../seo-panel/SeoScoreCard";
import { calculateSeoScore } from "../../utlis/calculateSeoScore";
import { analyzeSeoChecks } from "../../utlis/analyzeSeoChecks";

const PAGE_SIZE = 5;

// Helper function to normalize metafields from getBlogs API
// Transforms title_tag → metaTitle, description_tag → metaDescription
function normalizeMetafields(metafields) {
  if (!metafields?.edges) return { edges: [] };

  const titleTags = metafields.edges.filter(m => m.node.key === "title_tag") || [];
  const descriptionTags = metafields.edges.filter(m => m.node.key === "description_tag") || [];

  const latestTitle = titleTags[titleTags.length - 1];
  const latestDescription = descriptionTags[descriptionTags.length - 1];

  let newEdges = [];

  if (latestTitle) {
    newEdges.push({
      node: {
        key: "metaTitle",
        value: latestTitle.node.value
      }
    });
  }

  if (latestDescription) {
    newEdges.push({
      node: {
        key: "metaDescription",
        value: latestDescription.node.value
      }
    });
  }

  return { edges: newEdges };
}

function extractArticleNumericId(fullGid) {
  if (!fullGid) return null;
  // Try GID numeric suffix or last numeric sequence
  const matches = String(fullGid).match(/(\d+)(?!.*\d)/);
  return matches ? matches[1] : null;
}

function getShopifyEditUrlFromShop(shop, articleId) {
  const numeric = extractArticleNumericId(articleId);
  if (!numeric) return null;

  if (!shop) return null;
  // handle shop values like "storename.myshopify.com" or "https://storename.myshopify.com"
  const hostname = shop.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const shopName = hostname.replace(/\.myshopify\.com$/, "") || hostname;
  return `https://admin.shopify.com/store/${shopName}/content/articles/${numeric}`;
}

// Helper function to calculate SEO score for an article
// Uses the common analyzeSeoChecks function for consistency
function calculateArticleSeoScore(articleData, allAuthorsFromManagement = []) {
  if (!articleData) return 0;

  // Ensure articleData has the correct structure
  // If articleData is nested (article.article), use it directly
  // The analyzeSeoChecks function expects the article object with body, metafields, author, etc.
  const article = articleData?.article || articleData;

  if (!article) return 0;

  // Use common SEO analysis function with all authors from management
  const analyses = analyzeSeoChecks(article, null, allAuthorsFromManagement);
  const { score } = calculateSeoScore(analyses);
  return score;
}

// Helper function to get status info based on score
function getScoreStatus(score) {
  if (score >= 70) {
    return {
      label: "Good",
      tone: "success",
      icon: CheckCircleIcon,
      progressColor: "success",
    };
  }
  if (score >= 40) {
    return {
      label: "Medium",
      tone: "attention",
      icon: AlertTriangleIcon,
      progressColor: "highlight",
    };
  }
  return {
    label: "Very Low",
    tone: "critical",
    icon: AlertCircleIcon,
    progressColor: "critical",
  };
}

// Component to display SEO score with progress bar and icon
const SeoScoreDisplay = ({ score }) => {
  const status = getScoreStatus(score);

  return (
    <BlockStack gap="200">
      <InlineStack gap="100" align="start" blockAlign="center">
        <Icon source={status.icon} tone={status.tone} />
        <Badge tone={status.tone}>{status.label}</Badge>
        <Text variant="bodyMd" fontWeight="semibold" tone="subdued">
          {score}
        </Text>
      </InlineStack>
      <Box minWidth="100px" maxWidth="180px">
        <ProgressBar progress={score} size="small" tone={status.progressColor} />
      </Box>
    </BlockStack>
  );
};

const BlogOptimization = () => {
  const dispatch = useDispatch();
  const shop = useContext(ShopContext);
  const { selectedBlogId, selectedBlogData } = useSelector((state) => state.blog);
  const [page, setPage] = useState(1);

  // Fetch blogs
  const { data: blogsData, isLoading: isBlogsLoading, isError: isBlogsError } = useGetBlogsQuery({ shop }, { skip: !shop });

  // Fetch all authors from authors management system
  const { data: authorsData } = useGetAllAuthorsQuery(shop, { skip: !shop });
  const allAuthorsFromManagement = authorsData?.data || [];

  // Get SEO score data - MUST be called unconditionally (Rules of Hooks)
  // This hook will handle the skip logic internally
  const seoScoreData = useSeoScoreData();

  // Flatten blog articles and normalize metafields
  const blogArticles = useMemo(() => {
    if (!blogsData?.data?.data?.blogs?.edges) return [];

    const articles = [];
    blogsData.data.data.blogs.edges.forEach((blogEdge) => {
      const blogNode = blogEdge.node;
      const articleEdges = blogNode.articles?.edges || [];
      articleEdges.forEach((articleEdge) => {
        const articleNode = articleEdge.node;
        // Normalize metafields: transform title_tag → metaTitle, description_tag → metaDescription
        const normalizedArticle = {
          ...articleNode,
          metafields: normalizeMetafields(articleNode.metafields)
        };
        articles.push({
          id: articleNode?.id,
          title: articleNode?.title || "Untitled",
          image: articleNode?.image?.src || articleNode?.image?.originalSrc || "",
          blogTitle: blogNode?.title || "Untitled Blog",
          blogId: blogNode?.id,
          article: normalizedArticle,
          blog: blogNode,
        });
      });
    });
    return articles;
  }, [blogsData]);

  // Reset to first page when the article list changes
  useEffect(() => {
    setPage(1);
  }, [blogArticles.length]);

  // Pagination logic for articles
  const totalPages = Math.max(1, Math.ceil(blogArticles.length / PAGE_SIZE));
  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return blogArticles.slice(start, start + PAGE_SIZE);
  }, [blogArticles, page]);

  // const handleViewClick = (articleNode) => {
  //   dispatch(selectBlog({ id: articleNode.id }));
  // };
  // Handlers
  const handleViewClick = useCallback(
    (articleId) => {
      if (!articleId) return;
      // Find the article from blogArticles and set it in Redux
      const selectedArticle = blogArticles.find(art => art.id === articleId);
      if (selectedArticle) {
        // Set the normalized article data (with normalized metafields) in Redux
        dispatch(selectBlog({ id: articleId }));
        dispatch(setSelectedBlogData(selectedArticle.article));
      }
    },
    [dispatch, blogArticles]
  );

  const handleBack = useCallback(() => {
    dispatch(clearSelectedBlog());
    setPage(1);
  }, [dispatch]);


  // DataTable rows (paginated)
  const tableRows = useMemo(() => {
    return paginatedArticles.map((article) => {
      const title = article?.title || "Untitled";
      // Pass the full article object and all authors from management
      const seoScore = calculateArticleSeoScore(article, allAuthorsFromManagement);
      return [

        <InlineStack gap="400" blockAlign="center" wrap={false} key={`title-inline-${article?.id}`}>
          <Box>
            {article?.image ? (
              <Avatar
                source={article?.image}
                alt={article?.title || "Blog article"}
                size="md"
              />
            ) : (
              <Avatar size="md" name={article?.title || "Blog"} />
            )}
          </Box>
          <span
            style={{
              textDecoration: "none",
              cursor: "pointer",
              // outline: "none", 
              hover: {
                textDecoration: "underline",
                // color: "#2d72d2",
              },
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick(article?.id);
            }}
          >
            <Text as="span" variant="bodyMd" tone="subdued" display="inline" fontWeight="semibold">
              {title}
            </Text>
          </span>
        </InlineStack>,
        // Blog Name column 
        <Text as="h3" variant="bodyMd" tone="subdued" maxWidth="220px" display="inline-block" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" truncate>
          {article?.blogTitle || "—"}
        </Text>,
        // SEO Score column with progress bar and icon
        <SeoScoreDisplay score={seoScore} />,
        <Box style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button variant="secondary" size="slim" onClick={() => handleViewClick(article?.id)}>View</Button>
        </Box>,
      ];
    });
  }, [paginatedArticles, handleViewClick, allAuthorsFromManagement]);

  // Get selected article from blogArticles or selectedBlogData
  const selectedArticle = useMemo(() => {
    if (selectedBlogId) {
      return blogArticles.find(art => art.id === selectedBlogId)?.article || selectedBlogData;
    }
    return null;
  }, [selectedBlogId, blogArticles, selectedBlogData]);

  const blog = selectedArticle || {};
  const blogTitle = blog?.title || "Untitled";
  const shopifyEditUrl = getShopifyEditUrlFromShop(shop, blog?.id);

  if (!selectedBlogId) {
    if (isBlogsLoading || !blogsData) {
      return (
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Box paddingBlockStart="800" paddingBlockEnd="800" style={{ textAlign: "center" }}>
                <BlockStack gap="400" align="center">
                  <Spinner size="large" accessibilityLabel="Loading blogs" />
                  <Text variant="bodyMd" tone="subdued">
                    Loading blogs...
                  </Text>
                </BlockStack>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      );
    }

    if (isBlogsError) {
      return (
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <Box paddingBlockStart="400" paddingBlockEnd="400">
                <Banner tone="critical">
                  Error loading blogs. Please try again.
                </Banner>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>
      );
    }

    // Table view
    return (
      <Layout>

        <Layout.Section>
          <Card sectioned>
            <InlineStack align="baseline" gap="200">
              <Text as="h2" variant="headingMd" >
                Blog Optimization
              </Text>
            </InlineStack>
            <Box paddingBlockStart="400">
              <Text variant="bodySm" tone="subdued">
                Click on a blog article below to view its SEO score and optimization recommendations.
              </Text>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          {blogArticles.length === 0 ? (
            <Card sectioned>
              <Box padding="800" style={{ textAlign: "center" }}>
                <EmptyState
                  heading="No blogs found"
                  action={{
                    content: "Add blogs",
                    onAction: () =>
                      window.open(`https://${shop}/admin/blogs`, "_blank"),
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    You don't have any blogs yet. Add a blog and articles in your Shopify admin to start analyzing and optimizing them here.
                  </p>
                </EmptyState>
              </Box>
            </Card>
          ) : (
            <Card>
              <Box padding="400">
                <DataTable
                  columnContentTypes={["text", "text", "text", "text"]}
                  headings={["Article", "Blog Title", "SEO Score", "View SEO Issues"]}
                  rows={tableRows}
                  footerContent={`Total articles: ${blogArticles.length}`}
                />
                <Box paddingBlockStart="300">
                  <Pagination
                    hasPrevious={page > 1}
                    onPrevious={() => setPage((prev) => Math.max(prev - 1, 1))}
                    hasNext={page < totalPages}
                    onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    label={`Page ${page} of ${totalPages}`}
                  />
                </Box>
              </Box>
            </Card>
          )}
        </Layout.Section>
        <style>{`
          .blog-title-link {
            text-decoration: underline;
            color: #2d72d2;
            cursor: pointer;
          }
          .blog-title-link:hover, .blog-title-link:focus {
            color: #1a50a1;
          }
        `}</style>
      </Layout>
    );
  }


  return (
    <Layout>

      <Layout.Section>
        <Card>
          <InlineGrid columns="1fr auto" gap="400" align="center" justifyContent="space-between" >

            <BlockStack gap="100">

              <Text as="h2" variant="headingMd" >
                Blog SEO Analysis
              </Text>
              <Text tone="subdued" variant="bodyMd">
                Blog Title:  {blogTitle || ""}
              </Text>
            </BlockStack>
            {/* </BlockStack> */}
            <InlineStack gap="200">
              <div>
                <Button onClick={handleBack}>Back</Button>
              </div>

              <div>
                {shopifyEditUrl && (
                  <Button
                    variant="primary"
                    onClick={() => window.open(shopifyEditUrl, "_blank")}
                  >
                    Edit in Shopify
                  </Button>
                )}
              </div>

            </InlineStack>
          </InlineGrid>
        </Card>
      </Layout.Section>

      <Layout.Section>
        <Box>
          <InlineGrid gap="600" columns={{ xs: 1, md: "1fr 1.5fr" }}>
            {/* Left (content) column */}
            <Box>
              <BlockStack gap="500">
                {/* SEO Score Card - Now on left side */}
                <Card>
                  <Box padding="400">
                    <SeoScoreCard
                      score={seoScoreData.score}
                      critical={seoScoreData.critical}
                      good={seoScoreData.good}
                      unknown={seoScoreData.unknown}
                      lastScan={seoScoreData.lastScan}
                    />
                  </Box>
                </Card>

              </BlockStack>
            </Box>

            {/* Right (SEO panel) column */}
            <Box>
              <Card>
                <Box padding="400">
                  <ReadOnlySeoPanel />
                </Box>
              </Card>
            </Box>
          </InlineGrid>
        </Box>
      </Layout.Section>
    </Layout>
  );
};

export default BlogOptimization;
