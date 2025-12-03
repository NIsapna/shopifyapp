import React from 'react';
import { Page, Button, Layout, } from '@shopify/polaris'; 
import BlogList from './blogs/BlogList';

const Blogs = () => {
    return (
        <Page
            // fullWidth
            // backAction={{ content: 'Settings', url: '/' }}
            // title="Blog SEO Analyzer"
        // primaryAction={<Button variant="primary">Save</Button>}
        >
            <Layout>
                <Layout.Section>
                    <BlogList />
                </Layout.Section>
            </Layout>
        </Page>
    )
};

export default Blogs;
