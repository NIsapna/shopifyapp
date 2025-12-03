import { analyzeReadability } from "./analysers/analyzeReadability";
import { analyzeTOC } from "./analysers/analyzeTOC";
import { analyzeAuthorForSeo } from "./analysers/checkForAuthors";
import { analyzeExternalLinks, analyzeHeadings, analyzeImageAltTags, analyzeInternalLinks, analyzeMetaDescription, analyzeMetaTitle, analyzeCharCount } from "./seoAnalysis";
import { autoFixHeadings } from "./updateBlogField";

export const SEO_CHEKS = [

  {
    id: "meta_title",
    title: "Meta Title",
    description: "Write a clear, keyword-rich title that grabs clicks.",
    inputType: "text",
    isAutoFix: false,
    fieldKey: "metaTitle",
    getValue: (blog) => {
      const node = blog?.metafields?.edges?.find(edge => edge.node.key === "metaTitle")?.node;
      return node?.value || "";
    },
    saveValue: (blog, value) => {
      const newMetafields = blog?.metafields?.edges.map(edge => {
        if (edge?.node?.key === "metaTitle") {
          return { ...edge, node: { ...edge?.node, value } };
        }
        return edge;
      });
      return { ...blog, metafields: { edges: newMetafields } };
    },
    checkValue: analyzeMetaTitle,
  },
  {
    id: "meta_description",
    title: "Meta Description",
    description: "Add a short summary (150–160 chars) to improve CTR.",
    inputType: "textarea",
    isAutoFix: false,
    fieldKey: "metaDescription",
    getValue: (blog) => {
      const node = blog?.metafields?.edges?.find(edge => edge?.node?.key === "metaDescription")?.node;
      return node?.value || "";
    },
    saveValue: (blog, value) => {
      const newMetafields = blog?.metafields?.edges.map(edge => {
        if (edge?.node?.key === "metaDescription") {
          return { ...edge, node: { ...edge.node, value } };
        }
        return edge;
      });
      return { ...blog, metafields: { edges: newMetafields } };
    },
    checkValue: analyzeMetaDescription,
  },
  {
    id: "heading_tags",
    title: "Heading Tags (H1–H3)",
    description: "Structure content properly for SEO and easy reading.",
    inputType: "auto",
    isAutoFix: false,
    autoFix: (blog) => ({
      ...blog,
      body: autoFixHeadings(blog?.body) // fix headings in body
    }),
    getValue: (blog) => blog?.body || "",
    checkValue: (value) => {

      // Use our analyzer and flatten to show in panel
      const result = analyzeHeadings(value);
      // Combine messages into one string
      const message = `H1: ${result?.h1?.message}, H2: ${result?.h2?.message}, H3: ${result?.h3?.message}`;

      // Determine overall status
      const statuses = [result?.h1?.status, result?.h2?.status];
      const status = statuses.includes("missing")
        ? "missing"
        : statuses.includes("warning")
          ? "warning"
          : "good";

      return { status, message };
    },
  },
  {
    id: "internal_links",
    title: "Product, Collection & Internal Links",
    description: "Add at least 3 product/collection links with internal links to your blog posts to improve SEO.",
    inputType: "auto",
    isAutoFix: false,
    getValue: (blog) => blog?.body || "",
    checkValue: analyzeInternalLinks,
    saveValue: (blog, value) => blog,
  },
  {
    id: "external_links",
    title: "External Links",
    description: "Add credible sources to boost authority and trust.",
    inputType: "auto",
    isAutoFix: false,
    getValue: (blog) => blog?.body || "",
    checkValue: analyzeExternalLinks,
    saveValue: (blog, value) => blog,
  },
  {
    id: "char_count",
    title: "Content Length",
    description: "Ensure your blog has sufficient content length for better SEO.",
    inputType: "auto",
    isAutoFix: false,
    getValue: (blog) => blog?.body || "",
    checkValue: analyzeCharCount,
    saveValue: (blog, value) => blog,
  },
  {
    id: "author_bio",
    title: "Author with Bio",
    description: "Show author info and credentials to build trust.",
    inputType: "group", // nested fields
    isAutoFix: true,
    getValue: (blog) => blog?.author || {},
    checkValue: (author, blog, extra = {}, allAuthorsFromManagement = []) => {
      // extra is legacy assignedAuthors support
      // allAuthorsFromManagement is the new parameter for authors from management system
      return analyzeAuthorForSeo(blog?.author, extra, allAuthorsFromManagement);
    }
  },
]


export const PLANS = [
  {
    title: "Free Plan",
    planName: "free",
    description: "Ideal for new stores getting started with blog SEO.",
    price: "Free",
    frequency: "",
    features: [
      "Add 1 Author Profile",
      "Unlimited Blog Author Assignments",
      "Blog Optimization Analysis",
      "Author profile with bio & socials",
      "Support via Email"
    ],
    button: {
      content: "Get Started",
      props: {
        variant: "primary",
      },
    },
  },
  {
    title: "Pro Plan",
    planName: "pro",
    featuredText: "Most Popular",
    description: "For growing merchants who want more authors and enhanced features.",
    price: "$10",
    frequency: "month",
    features: [
      "Add up to 3 Author Profiles",
      "Unlimited Blog Author Assignments",
      "Blog Optimization Analysis",
      "Author profile with bio & socials",
      "Support via Email"
    ],
    button: {
      content: "Select Plan",
      props: {
        variant: "primary",
      },
    },
  },
  {
    title: "Growth Plan",
    planName: "growth",
    description: "Perfect for stores scaling content & SEO operations.",
    price: "$20",
    frequency: "month",
    features: [
      "Add up to 10 Author Profiles",
      "Unlimited Blog Author Assignments",
      "Blog Optimization Analysis",
      "Author profile with bio & socials",
      "Support via Email"
    ],
    button: {
      content: "Select Plan",
      props: {
        variant: "primary",
      },
    },
  },
  // {
  //   title: "Enterprise Plan",
  //   planName: "enterprise",
  //   description: "For large-scale merchants with managed SEO needs.",
  //   price: "$249",
  //   frequency: "month",
  //   features: [
  //     "Add unlimited Author Profiles",
  //     "Unlimited Blog Author Assignments",
  //     "Blog Optimization Analysis",
  //     "Author profile with bio & socials",
  //     "Support via Email"
  //   ],
  //   button: {
  //     content: "Select Plan",
  //     props: {
  //       variant: "primary",
  //     },
  //   },
  // },
];


