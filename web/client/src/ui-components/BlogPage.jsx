import React from 'react';
import { useParams } from 'react-router-dom';
import BlogDetail from '../components/BlogDetail';
import { Page, Button, Layout, } from '@shopify/polaris';

const BlogPage = () => {
  const { id } = useParams();
  return (
    <Page
      fullWidth
      backAction={{ content: 'Settings', url: '/' }}
      title="Blog SEO Analyzer"
      // primaryAction={<Button variant="primary">Save</Button>}
    >
      <Layout>
        <Layout.Section>
          <BlogDetail blogId={id} />;
        </Layout.Section>
      </Layout>
    </Page>
  )
};

export default BlogPage;
