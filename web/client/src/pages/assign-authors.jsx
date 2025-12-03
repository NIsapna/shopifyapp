import { Page, Card, Layout } from "@shopify/polaris";
import AssignAuthorstoBlog from "../ui-components/assign-authors/Index";

const AssignAuthors = () => {

    return (
        <Page
            title="Assign Authors to Blog"
        // backAction={{ content: 'Dashboard', url: '/dashboard' }}

        >
            <AssignAuthorstoBlog />
        </Page>
    );
};

export default AssignAuthors;
