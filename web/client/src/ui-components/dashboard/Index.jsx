import { BlockStack, Box, Button, Card, EmptyState, Icon, InlineStack, Text } from "@shopify/polaris";
import BlogTable from "../../components/BlogTable";
import BlogEditor from "./BlogEditor";
import { HomeIcon, ComposeIcon, SearchIcon } from '@shopify/polaris-icons';
import { useContext } from "react";
import ShopContext from "../../utlis/ShopContext";
import { useDispatch, useSelector } from "react-redux";
import { toggleSeoPanel } from "../../store/blogSlice";
import SeoPanel from "../seo-panel/SeoPanel";

const Dashboard = () => {
    const shop = useContext(ShopContext);
    const appName = shop?.replace(".myshopify.com", "");
    const dispatch = useDispatch();
    const { showSeoPanel, selectedBlogData, editMode, selectedBlogId } = useSelector((state) => state.blog);

    return (
        < >
            <Placeholder width="100%" background="#f5f5f5">
                <Box >
                    <BlogTable />
                </Box>
            </Placeholder>
        </>
    );
};

export default Dashboard;


const Placeholder = ({ children, height = '', width = 'auto', background, display = 'block' }) => {
    return (
        <div
            style={{
                height: height ?? undefined,
                width: width ?? undefined,
                // background: background,
                // padding: '20px',
                display: display,
                borderRadius: '8px',
            }}
        >
            {children}
        </div>
    );
};