import { useUpdateArticleMutation } from "../store/blogsApi";

export const useUpdateBlogField = () => {
  const [updateArticle] = useUpdateArticleMutation();

  const updateField = async ({ shop, blog, field, value }) => {
    try {
      const formData = new FormData();

      // Required fields
      const articleId = blog.id.split("/").pop();
      const blogId = blog.blog.id.split("/").pop();

      formData.append("id", articleId);
      formData.append("blog_id", blogId);

      // Only send the updated field
      formData.append(field, value);

      // Example: field could be "title", "body_html", "tags" etc.
      const response = await updateArticle({ shop, formData }).unwrap();
      return response;
    } catch (error) {
      console.error("Failed to update article:", error);
      throw error;
    }
  };

  return { updateField };
};


export const autoFixHeadings = (bodyHtml) => {
  if (!bodyHtml) return bodyHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(bodyHtml, "text/html");

  // Get all headings
  const h1Tags = Array.from(doc.querySelectorAll("h1"));
  const h2Tags = Array.from(doc.querySelectorAll("h2"));
  const h3Tags = Array.from(doc.querySelectorAll("h3"));

  // Fix multiple H1s: keep first H1, others → H2
  h1Tags.forEach((h1, index) => {
    if (index === 0) return;
    const h2 = doc.createElement("h2");
    h2.innerHTML = h1.innerHTML;
    h1.replaceWith(h2);
  });

  // Refresh h2Tags after conversion
  const updatedH2Tags = doc.querySelectorAll("h2");

  // Ensure at least one H2 exists
  if (updatedH2Tags.length === 0) {
    if (h3Tags.length > 0) {
      const firstH3 = h3Tags[0];
      const newH2 = doc.createElement("h2");
      newH2.innerHTML = firstH3.innerHTML;
      firstH3.replaceWith(newH2);
    } else {
      // Insert placeholder H2 at top
      const newH2 = doc.createElement("h2");
      newH2.textContent = "Subheading";
      doc.body.insertBefore(newH2, doc.body.firstChild);
    }
  }

  // Count H1/H2/H3 for analysis (optional)
  const finalH1 = doc.querySelectorAll("h1").length;
  const finalH2 = doc.querySelectorAll("h2").length;
  const finalH3 = doc.querySelectorAll("h3").length;

  console.log("Headings after fix:", { h1: finalH1, h2: finalH2, h3: finalH3 });
  console.log("innerHTML:",  doc.body.innerHTML);

  // Serialize HTML as string
  let fixedHtml = doc.body.innerHTML;

  // Remove extra line breaks and carriage returns
  fixedHtml = fixedHtml.replace(/(\r\n|\n|\r)/gm, ""); // remove all line breaks
  fixedHtml = fixedHtml.replace(/\s{2,}/g, " "); // replace multiple spaces with single space

  return fixedHtml;
};
