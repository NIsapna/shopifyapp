import React from 'react';
import BlogTable from '../components/BlogTable';
import { Page, Button, Layout, } from '@shopify/polaris';

const HomePage = () => {
  return (
    <Page
      fullWidth
      // backAction={{ content: 'Settings', url: '/' }}
      title="Blogs and Articles"
      // primaryAction={<Button variant="primary">Save</Button>}
    >
      <Layout>
        <Layout.Section>
          <BlogTable />;
        </Layout.Section>
      </Layout>
    </Page>
  )
};

export default HomePage;
