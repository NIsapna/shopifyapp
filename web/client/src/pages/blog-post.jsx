import { Page, Card, Layout } from "@shopify/polaris";
import Dashboard from "../ui-components/dashboard/Index";

const BlogPost = () => {

    return (
        <Page
        title="Blog Post"
        // backAction={{ content: 'Dashboard', url: '/dashboard' }}
     
        >
                <Dashboard />
        </Page>
    );
};

export default BlogPost;
