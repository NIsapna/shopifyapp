import React from 'react';
import { Page, Button, Layout, } from '@shopify/polaris';
import { Example } from './text-editor/Example';

const BlogEditor = () => {
    return (
        <Page
            fullWidth
            backAction={{ content: 'Settings', url: '/' }}
            title="Text editor"
        // primaryAction={<Button variant="primary">Save</Button>}
        >
            <Layout>
                <Layout.Section>
                    <Example />
                </Layout.Section>
            </Layout>
        </Page>
    )
};

export default BlogEditor;
