import React, { useContext } from "react";
import { Button, Box, Text, InlineStack, Thumbnail, Avatar } from "@shopify/polaris";
import ShopContext from "../../utlis/ShopContext";

const BlogOptimizationRow = ({ article, onViewClick }) => {
  const shop = useContext(ShopContext);
  if (!article) return null;

  // Get author name from article data
  const authorName = article?.article?.author?.name || "No author";

  // Extract the Shopify admin URL for editing the blog
  const getShopifyBlogEditUrl = () => {
    // article.blogId typically looks like "gid://shopify/Blog/123456"
    if (!shop || !article?.blogId) return null;
    const matches = article.blogId.match(/(\d+)$/);
    const blogId = matches ? matches[1] : null;
    if (!blogId) return null;
    return `https://${shop}/content/articles/${blogId}`;
  };
  // shopify://admin/articles/601882001651
  // https://admin.shopify.com/store/sumit-bula-store/content/articles/601881968883

  // https://admin.shopify.com/store/sumit-bula-store/content/articles/601865814259

  const blogEditUrl = getShopifyBlogEditUrl();
  console.log("blogEditUrl", blogEditUrl);
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .blog-row-blog-name,
          .blog-row-author {
            display: none !important;
          }
        }
        .blog-title-link {
          text-decoration: underline;
          color: #2d72d2;
          cursor: pointer;
        }
        .blog-title-link:hover, .blog-title-link:focus {
          color: #1a50a1;
        }
      `}</style>
      <Box
        padding="400"
        borderBlockEndWidth="025"
        borderColor="border-subdued"
        onClick={() => onViewClick(article.id)}
        style={{
          cursor: "pointer",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f6f6f7";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <InlineStack align="space-between" blockAlign="center" gap="400">
          {/* Left Section: Image and Title */}
          <InlineStack gap="400" blockAlign="center" wrap={false}>
            <Box minWidth="80px">
              {article.image ? (
                <Thumbnail
                  source={article.image}
                  alt={article.title || "Blog article"}
                  size="medium"
                />
              ) : (
                <Avatar size="md" name={article.title || "Blog"} />
              )}
            </Box>

            <Box minWidth={0}>
              {/* <Text as="h3" variant="bodyMd" fontWeight="semibold" truncate>
                {article.title || "Untitled"}
              </Text> */}

              <span
                className="blog-title-link"
                tabIndex={0}
                onClick={e => {
                  e.stopPropagation();
                  window.open(`https://admin.shopify.com/store/${shop}/content/articles/${article.blogId}`, "_blank");
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    window.open(`https://admin.shopify.com/store/${shop}/content/articles/${article.blogId}`, "_blank");
                  }
                }}
                role="link"
                aria-label={`Edit ${article.title} in Shopify`}
              >
                <Text as="h3" variant="bodyMd" tone="subdued" display="inline">
                  {article.title}
                </Text>
              </span>

              {/* {article.title && (
                blogEditUrl ? (
                  <span
                    className="blog-title-link"
                    tabIndex={0}
                    onClick={e => {
                      e.stopPropagation();
                      window.open(`https://admin.shopify.com/store/${shop}/content/articles/${article.blogId}`, "_blank");
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        window.open(`https://admin.shopify.com/store/${shop}/content/articles/${article.blogId}`, "_blank");
                      }
                    }}
                    role="link"
                    aria-label={`Edit ${article.title} in Shopify`}
                  >
                    <Text as="h3" variant="bodyMd" tone="subdued" display="inline">
                      {article.title}
                    </Text>
                  </span>
                ) : (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {article.title}
                  </Text>
                )
              )} */}
            </Box>
          </InlineStack>

          {/* Middle Section: Blog and Author */}
          <InlineStack gap="600" blockAlign="center" wrap={false}>
            <Box
              minWidth="120px"
              className="blog-row-blog-name"
            >
              {blogEditUrl ? (
                <span
                  className="blog-title-link"
                  tabIndex={0}
                  onClick={e => {
                    e.stopPropagation();
                    window.open(blogEditUrl, "_blank");
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      window.open(blogEditUrl, "_blank");
                    }
                  }}
                  role="link"
                  aria-label={`Edit ${article.blogTitle} in Shopify`}
                >
                  <Text as="p" variant="bodySm" fontWeight="medium" display="inline">
                    {article.blogTitle || "—"}
                  </Text>
                </span>
              ) : (
                <Text as="p" variant="bodySm" fontWeight="medium">
                  {article.blogTitle || "—"}
                </Text>
              )}
            </Box>

            {/* <Box
              minWidth="120px"
              className="blog-row-author"
            >
              <Text as="p" variant="bodySm" tone="subdued">
                {authorName}
              </Text>
            </Box> */}
          </InlineStack>

          {/* Right Section: Action Button */}
          <Box minWidth="120px">
            <InlineStack align="end">
              <Button
                variant="primary"
                size="slim"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewClick(article.id);
                }}
              >
                View SEO Issues
              </Button>
            </InlineStack>
          </Box>
        </InlineStack>
      </Box>
    </>
  );
};

export default BlogOptimizationRow;

