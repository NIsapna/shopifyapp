import { Box, InlineStack } from "@shopify/polaris";
import { useSelector } from "react-redux";
import BlogEditor from "../dashboard/BlogEditor";
import BlogTable from "../../components/BlogTable";
import OnlyBlogs from "../../components/OnlyBlogs";
import SeoPanel_copy from "../seo-panel/SeoPanel_copy";

const BlogList = () => {
  const { selectedBlogId, editMode } = useSelector((state) => state.blog);

  return (
    <Box padding="20px">
      {/* Blog Table is always visible */}
      <Box marginBottom="20px">
        <OnlyBlogs />
      </Box>

      {/* Show two-column editor + SEO panel only when a blog is selected */}
      {selectedBlogId && (
        <div className="blog_Main_Ui">
          {/* Left Column: Blog Editor */}
          <Placeholder width="40%" bg="#fff">
            <SeoPanel_copy />
          </Placeholder>

          {/* Right Column: SEO Panel */}
          <Placeholder width="70%" background="#f5f5f5">
            <BlogEditor />
          </Placeholder>
        </div>
      )}
    </Box>
  );
};

export default BlogList;
const Placeholder = ({ children, height = '', width = 'auto', background }) => {
  return (
    <div
      style={{
        height: height ?? undefined,
        width: width ?? undefined,
        background: background,
        padding: '20px',
      }}
    >
      {children}
    </div>
  );
};