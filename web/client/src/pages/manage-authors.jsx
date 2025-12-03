// src/pages/AuthorsPage.jsx
import React from "react";
import AuthorList from "../ui-components/author-management/AuthorList";
import { Layout, Page } from "@shopify/polaris";

export default function AuthorsPage() {
  return (
    <Page
      // fullWidth
      // backAction={{ content: 'Settings', url: '/' }}
      title="Manage Authors"
      // backAction={{ content: 'Blog Post', url: '/blog-post' }}

    >
      <Layout>
        <Layout.Section>
          <AuthorList />
        </Layout.Section>
      </Layout>
    </Page>
  )
}
