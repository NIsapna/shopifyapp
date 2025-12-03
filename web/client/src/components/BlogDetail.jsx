import React, { useContext, useState } from 'react';
import { MediaCard, Spinner, InlineGrid, Text, Card, BlockStack, Box, Button } from '@shopify/polaris';
import {
    SearchIcon
} from '@shopify/polaris-icons';
import { useGetBlogByIdQuery } from '../store/blogsApi';
import SeoAnalysis from './SeoAnalysis';
import ShopContext from '../utlis/ShopContext';

const BlogDetail = ({ blogId }) => {
      const shop = useContext(ShopContext);
    const { data: blog, isLoading } = useGetBlogByIdQuery({shop, id: blogId });
    const [showAnalysis, setShowAnalysis] = useState(false);
    // console.log(blog);
    const [updatedHtml, setUpdatedHtml] = useState(null);
    const [updatedBlog, setUpdatedBlog] = useState(null); // store full updated blog object


    if (isLoading) return <Spinner accessibilityLabel="Loading blog" size="large" />;

    // Defensive checks for blog and nested fields
    const blogTitle = updatedBlog?.title || blog?.title || 'Untitled';
    const imageSrc = blog?.image?.originalSrc;
    const body = updatedBlog?.body || blog?.body || '';
    const tags = updatedBlog?.tags || blog?.tags || [];
    const author =  blog?.author || {};
    const metaDescNode = updatedBlog?.metaDescNode ||  "";

    // console.log(updatedBlog);

    return (
        <InlineGrid columns={['twoThirds', 'oneThird']} gap="400">
            <div className='artical'>

                <Card roundedAbove="sm">
                    <BlockStack gap="200">
                        <InlineGrid columns="1fr auto">
                            <Text as="h2" variant="headingSm">
                                Blog: {blogTitle}
                            </Text>
                            <Button
                                onClick={() => { setShowAnalysis(true) }}
                                accessibilityLabel="Add variant"
                                icon={SearchIcon}
                            >
                                Start Analyse
                            </Button>
                        </InlineGrid>
                        <Box as="p" variant="bodyMd">
                            <div dangerouslySetInnerHTML={{ __html: body }} />
                        </Box>
                    </BlockStack>
                </Card>
            </div>
            <div>
                <SeoAnalysis
                    html={body}
                    showAnalysis={showAnalysis}
                    blogTitle={blogTitle}
                    imageSrc={imageSrc}
                    tags={tags}
                    blogId={blogId}
                    metaDescNode={metaDescNode}
                    author={author}
                    onFix={(updatedBlogData) => setUpdatedBlog(updatedBlogData)}

                />
            </div>
        </InlineGrid>
    );
};

export default BlogDetail;
