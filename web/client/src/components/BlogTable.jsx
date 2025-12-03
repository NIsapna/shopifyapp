import React, { useState, useEffect, useContext, useRef } from "react";
import { Card, Spinner, Text, Button, DataTable, EmptyState, Banner, InlineGrid, BlockStack, Box, InlineStack, Avatar, Layout } from "@shopify/polaris";
import { useDispatch, useSelector } from "react-redux";
import { useGetBlogsQuery, useGetBlogByIdQuery } from "../store/blogsApi";
import { selectBlog, clearSelectedBlog, setSelectedBlogData } from "../store/blogSlice";
import ShopContext from "../utlis/ShopContext";
import { useGetAllAssignAuthorQuery } from "../store/snippetApi";
import SeoPanel from "../ui-components/seo-panel/SeoPanel";
import BlogEditor from "../ui-components/dashboard/BlogEditor";
import { usePlan } from "../context/PlanContext";
import NoPlanOverlay from "../ui-components/comman/NoPlanLayout";
import UpgradeOverlay from "../ui-components/comman/UpgradeOverlay";

const BlogTable = () => {
  const dispatch = useDispatch();
  const BaseURL = import.meta.env.VITE_HOST;
  const shop = useContext(ShopContext);
  const { planName, isPlanActive, noPlanSelected, isPlanExpired, isPlanPending } = usePlan();

  const { selectedBlogId, selectedBlogData, editMode } = useSelector((state) => state.blog);
  const { data: assignedAuthor, error: assignErr, isLoading: loadAssignAuth } = useGetAllAssignAuthorQuery({
    shop: shop,
    blogId: selectedBlogData?.blog?.id,
    articleId: selectedBlogData?.id,
  },
    { skip: !selectedBlogData?.id, refetchOnMountOrArgChange: true }
  );
  const authorsToShow = loadAssignAuth ? {} : assignedAuthor?.authorsData || {};

  // Blogs list
  const { data, isLoading, isError, error } = useGetBlogsQuery({ shop });

  // Blog details
  const { data: blogDetail, isLoading: loadingDetail } = useGetBlogByIdQuery(
    { shop, id: selectedBlogId },
    { skip: !selectedBlogId, refetchOnMountOrArgChange: true, }
  );

  useEffect(() => {
    if (blogDetail?.data) {
      dispatch(setSelectedBlogData(blogDetail?.data));
    }
  }, [blogDetail, dispatch, selectedBlogId]);

  const handleViewBlog = (art) => {
    dispatch(selectBlog({ id: art.id }));
  };

  const handleBack = () => {
    dispatch(clearSelectedBlog());
  };

  if (isLoading) return <Spinner accessibilityLabel="Loading blogs" />;

  const blogEdges = data?.data?.data?.blogs?.edges || [];
  const rows = [];
  let serial = 1;

  blogEdges.forEach((blogEdge) => {
    const blogNode = blogEdge.node;
    const articles = blogNode.articles?.edges || [];

    articles.forEach((articleEdge) => {
      const articleNode = articleEdge.node;
      rows.push([
        blogNode?.title,
        articleNode?.title,
        <Button
          size="slim"
          onClick={() => handleViewBlog(articleNode)}
          disabled={noPlanSelected}
        >
          View
        </Button>,
      ]);
    });
  });

  if (!selectedBlogId) {
    return (
      <Layout>
        <Layout.Section>
          {isPlanExpired && (
            <UpgradeOverlay message="Your plan expired! Please upgrade your plan." />
          )}

          {isPlanPending && (
            <>
              <NoPlanOverlay message="Your payment is not completed. Please purches the plan. " />
            </>
          )}
        </Layout.Section>
        <Layout.Section>
          {
            noPlanSelected ?
              <div className="relative min-h-screen">
                <NoPlanOverlay message="You don’t have any plan selected yet. Please choose one to start using the app." />
              </div>
              :
              <Card >
                <InlineStack align="baseline" gap="200">
                  <Text as="h1" variant="headingLg">
                    All Blogs
                  </Text>
                  <Text tone="subdued">
                    (select a blog to analyze and optimize its SEO)
                  </Text>
                </InlineStack>
              </Card>
          }
        </Layout.Section>
        <Layout.Section>
          <Box padding={400} >
            {rows?.length === 0 ? (
              <EmptyState
                heading="No blogs found"
                action={{
                  content: "Add blogs ",
                  onAction: () =>
                    window.open(`https://${shop}/admin/blogs`, "_blank"),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  You don’t have any blogs yet. Add a blog and articles in your Shopify admin to start analyzing and optimizing them here.
                </p>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "text"]}
                headings={["Blog Name", "Article Name", "Action"]}
                rows={rows}
                footerContent={`Total articles: ${rows.length}`}
              />
            )}
          </Box>
        </Layout.Section>
      </Layout>
    );
  }

  if (loadingDetail) return <Spinner accessibilityLabel="Loading blog details" />;

  // Show single blog view
  const blog = blogDetail?.data || {};
  const blogTitle = blog?.title || "Untitled";

  return (
    <>
      <Layout>
        <Layout.Section>
          {isPlanExpired && (
            <UpgradeOverlay message="Your plan expired! Please upgrade your plan to fix the blog issues." />
          )}
          {isPlanPending && (
            <>
              <NoPlanOverlay message="Your payment is not completed. Please purches the plan to fix the blog issues " />
            </>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <InlineGrid columns="1fr auto">
              <s-stack direction="inline" gap="small-300" alignItems="last baseline" >
                <Text as="h1" variant="headingLg">
                  Blog Analyse
                </Text>
                {/* <Text tone="subdued">
                  ({blogTitle || ""})
                </Text> */}
              </s-stack>
              <Button onClick={handleBack}>Back</Button>
            </InlineGrid>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Box >
            <InlineGrid gap="600"
              columns={{ xs: 1,  md: "2fr 1fr" }}
            >
              {/* Left (content) column with sticky container, scroll only artical content */}
              <Box >
                <Card >
                  <div style={{ flex: 1, paddingBlock: '20px' }} >
                    {selectedBlogData && editMode ? (
                      <BlogEditor />
                    ) : (
                      <BlockStack gap="200">

                        <Text as="h5" variant="bodyMd" fontWeight="bold">
                          {blogTitle || ""}
                        </Text>

                        {/* Display metaTitle and metaDescription if present in blog.metafields */}
                        {blog?.metafields?.edges && Array.isArray(blog.metafields.edges) && (() => {
                          let metaTitleValue = '';
                          let metaDescriptionValue = '';
                          blog.metafields.edges.forEach(edge => {
                            if (edge?.node?.key === 'metaTitle') metaTitleValue = edge.node.value;
                            if (edge?.node?.key === 'metaDescription') metaDescriptionValue = edge.node.value;
                          });
                          return (
                            <>
                              {metaTitleValue && (
                                <Box paddingBlockEnd="200">
                                  <Text as="h6" variant="bodyMd" fontWeight="bold">
                                    Meta Title:
                                  </Text>
                                  <Text as="span" variant="bodyMd">{metaTitleValue}</Text>
                                </Box>
                              )}
                              {metaDescriptionValue && (
                                <Box>
                                  <Text as="h6" variant="bodyMd" fontWeight="bold">
                                    Meta Description:
                                  </Text>
                                  <Text as="span" variant="bodyMd">{metaDescriptionValue}</Text>
                                </Box>
                              )}
                            </>
                          );
                        })()}

                        <Box as="div" variant="bodyMd">
                          <Text as="h6" variant="bodyMd" fontWeight="bold">
                            Content:
                          </Text>
                          <div className="artical" dangerouslySetInnerHTML={{ __html: blog.body }} />
                        </Box>


                      </BlockStack>
                    )}
                  </div>
                </Card>
              </Box>

              {/* Right (SEO panel) column - sticky container, only its internal content scrolls */}
              <Box >
                <Card >
                  <SeoPanel />
                </Card>
              </Box>
            </InlineGrid>
          </Box>
        </Layout.Section>
      </Layout>
    </>
  );
};

export default BlogTable;
