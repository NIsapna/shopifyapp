// helpers/seoFixers.js

export const fixBlogTitle = ({ blogData, newTitle }) => {
  if (!blogData || !newTitle) return blogData;

  return {
    ...blogData,
    title: newTitle, // backend expects 'title'
  };
};
