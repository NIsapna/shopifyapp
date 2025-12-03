import React, { useState, useEffect, useContext } from "react";
import { Card, Spinner, Text, Button, DataTable, EmptyState, Banner, InlineGrid, BlockStack, Box, InlineStack, Avatar } from "@shopify/polaris";
import { useDispatch, useSelector } from "react-redux";
import { useGetBlogsQuery, useGetBlogByIdQuery } from "../store/blogsApi";
import { selectBlog, clearSelectedBlog, setSelectedBlogData } from "../store/blogSlice";
import ShopContext from "../utlis/ShopContext";
import { useGetAllAssignAuthorQuery } from "../store/snippetApi";

const OnlyBlogs = () => {
  const dispatch = useDispatch();
  const BaseURL = import.meta.env.VITE_HOST;
  const shop = useContext(ShopContext);
  const { selectedBlogId, selectedBlogData } = useSelector((state) => state.blog);

  // Assigned authors for the selected blog
  const { data: assignedAuthor, error: assignErr, isLoading: loadAssignAuth } = useGetAllAssignAuthorQuery({
    shop: shop,
    blogId: selectedBlogData?.blog?.id,
    articleId: selectedBlogData?.id,
  },
    { skip: !selectedBlogData?.id, refetchOnMountOrArgChange: true }
  );
  const authorsToShow = loadAssignAuth ? {} : assignedAuthor?.authorsData || {};
  // console.log("Assigned Author Data:", assignErr, assignedAuthor);

  // Blogs list
  const { data, isLoading, isError, error } = useGetBlogsQuery({ shop });
  // console.log("Blogs list data:", data, isError, error);

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
    // console.log(blogEdge);

    articles.forEach((articleEdge) => {
      const articleNode = articleEdge.node;
      rows.push([
        // serial++,
        blogNode?.title,
        articleNode?.title,
        <Button
          size="slim"
          onClick={() => handleViewBlog(articleNode)}
        >
          View
        </Button>,
      ]);
    });
  });

  if (!selectedBlogId) {
    return (
      <Box padding={400} d>
        <DataTable
          columnContentTypes={[ "text", "text", "text"]}
          headings={[  "Blog Name", "Article Name", "Action"]}
          rows={rows}
          footerContent={`Total articles: ${rows.length}`}
          // pagination={{
          //   hasNext: true,
          //   onNext: () => {},
          // }}
        />
      </Box>
    );
  }

};

export default OnlyBlogs;
