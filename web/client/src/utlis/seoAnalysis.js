// src/utils/seoAnalysis.js
import { getShopNameFull, getShopNameShort } from "./shopHelper";

// Meta Title analysis criteria:
// - Presence of a title
// - Length between 50 and 60 characters (optimal for SEO, prevents truncation in SERPs)
// - Uniqueness and relevance (not checked in this function, just length and presence)
// - Keyword use (not enforced here, but recommended)

export const analyzeMetaTitle = (value) => {
  console.log("analyzeMetaTitle", value)
  if (!value || value.trim() === "") {
    return { status: "missing", message: "No title found. Add a keyword-rich meta title." };
  }
  const length = value.trim().length;
  if (length < 50) {
    return { status: "warning", message: "Title is too short (aim for 50–60 characters)." };
  }
  if (length > 100) {
    return { status: "warning", message: "Title is too long and may be truncated (aim for 50–60 characters)." };
  }
  return { status: "good", message: "Title length is optimal for SEO." };
};

// Meta Description analysis criteria:
// - Presence of description
// - Length between 120 and 160 characters (optimal for SEO, prevents truncation in SERPs)
// - Compelling/keyword use (not enforced here, just length and presence)

export const analyzeMetaDescription = (value) => {
  console.log("analyzeMetaDescription", value)
  if (!value || value.trim() === "") {
    return { status: "missing", message: "No meta description found. Add a concise summary." };
  }
  const length = value.trim().length;
  if (length < 120) {
    return { status: "warning", message: "Meta description is too short (aim for 120–160 characters)." };
  }
  if (length > 190) {
    return { status: "warning", message: "Meta description is too long and may be truncated (aim for 120–160 characters)." };
  }
  return { status: "good", message: "Meta description length is optimal for SEO." };
};


export const analyzeHeadings = (html) => {
  // console.log("html", html)
  if (!html) return { status: "missing", message: "No content found" };

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const h1Tags = doc.querySelectorAll("h1");
  const h2Tags = doc.querySelectorAll("h2");
  const h3Tags = doc.querySelectorAll("h3");

  // H1 check
  let h1Status;
  if (h1Tags.length === 0) h1Status = { status: "missing", message: "No H1 found" };
  else if (h1Tags.length > 1) h1Status = { status: "missing", message: "Multiple H1 tags found" };
  else h1Status = { status: "good", message: "H1 is fine" };

  // H2 check
  const h2Status = h2Tags.length === 0
    ? { status: "missing", message: "No H2 found" }
    : { status: "good", message: `H2 count: ${h2Tags.length}` };

  // H3 check
  const h3Status = { status: "info", message: `H3 count: ${h3Tags.length}` };

  return { h1: h1Status, h2: h2Status, h3: h3Status, counts: { h1: h1Tags.length, h2: h2Tags.length, h3: h3Tags.length } };
};

// Analyze image alt tags
export const analyzeImageAltTags = (html) => {
  if (!html) return { status: "missing", message: "No content to analyze" };

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const images = doc.querySelectorAll("img");
  if (images.length === 0) return { status: "info", message: "No images found" };

  const missingAlt = Array.from(images).filter((img) => !img.alt || img.alt.trim() === "");
  if (missingAlt.length === 0) return { status: "good", message: "All images have alt tags" };

  return { status: "warning", message: `${missingAlt.length} images missing alt tags` };
};

// Analyze character count of blog content
export const analyzeCharCount = (html) => {
  if (!html) return { status: "missing", message: "No content to analyze" };

  // Parse HTML to get text content (strip HTML tags)
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const textContent = doc.body.textContent || doc.body.innerText || "";
  
  // Count characters (excluding whitespace at start/end)
  const charCount = textContent.trim().length;

  // SEO recommendations for blog content length:
  // - Minimum: 300 words (approximately 1500-1800 characters)
  // - Good: 1000-2000 words (approximately 5000-10000 characters)
  // - Optimal: 2000+ words (approximately 10000+ characters)

  if (charCount === 0) {
    return { status: "missing", message: "No content found. Add blog content to improve SEO." };
  } else if (charCount < 1000) {
    return { status: "missing", message: `Content is too short (${charCount.toLocaleString()} characters). Aim for at least 1,500-2,000 characters for better SEO.` };
  } else if (charCount < 1500) {
    return { status: "warning", message: `Content length is ${charCount.toLocaleString()} characters. Consider expanding to 1500+ characters for optimal SEO.` };
  } else if (charCount < 2000) {
    return { status: "good", message: `Content length is ${charCount.toLocaleString()} characters. Good length for SEO.` };
  } else {
    return { status: "good", message: `Content length is ${charCount.toLocaleString()} characters. Excellent length for SEO.` };
  }
};


// returns array of links needing fix
export const getLinksToFix = (html) => {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = Array.from(doc.querySelectorAll("a[href]"));

  return links
    .filter((a) => !a.getAttribute("href") || a.getAttribute("href") === "#")
    .map((a) => ({
      text: a.textContent || "N/A",
      href: a.getAttribute("href") || "",
      node: a,
      type: "empty/hash",
    }));
};

/**
 * Helper function to extract domain from a URL
 */
const getDomainFromUrl = (url) => {
  try {
    // Handle protocol-relative URLs (//example.com)
    if (url.startsWith("//")) {
      url = `https:${url}`;
    }
    // Handle relative URLs
    if (url.startsWith("/")) {
      return null; // Relative URLs don't have a domain
    }
    // Handle absolute URLs
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase();
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Helper function to check if a URL is internal to the shop
 */
const isInternalLink = (href, shopShort, shopFull) => {
  if (!href || href.trim() === "" || href === "#") return false;

  // Relative links are always internal
  if (href.startsWith("/")) return true;

  // Check if it's an absolute URL
  const domain = getDomainFromUrl(href);
  if (!domain) return false;

  // Check if domain matches shop domain (case-insensitive)
  const shopDomain = shopFull.toLowerCase();
  const shopShortName = shopShort.toLowerCase();

  // Exact domain match
  if (domain === shopDomain) return true;

  // Check if domain contains shop short name (for subdomains like blog.shopname.myshopify.com)
  if (shopShortName && domain.includes(shopShortName)) {
    // Verify it's actually the shop's domain, not just a substring match
    // Check if it ends with .myshopify.com or contains the shop name as a subdomain
    if (domain.endsWith(".myshopify.com") || domain.includes(`.${shopShortName}.`)) {
      return true;
    }
  }

  return false;
};

/**
 * Helper function to check if a URL is a product or collection link
 */
const isProductOrCollectionLink = (href) => {
  if (!href || href.trim() === "" || href === "#") return false;

  // Normalize the href to check for product/collection patterns
  const normalizedHref = href.toLowerCase().trim();

  // Check for product links:
  // - /products (exact match or end of string)
  // - /products/ (with trailing slash)
  // - /products/product-handle (with product handle)
  // - Absolute URLs containing /products (with or without trailing slash)
  // Examples: /products, /products/, /products/abc, https://shop.com/products, https://shop.com/products/
  if (normalizedHref.includes("/products")) {
    // Match: /products, /products/, /products/anything, or ends with /products
    const productsMatch = normalizedHref.match(/\/products(?:\/|$|\/[^\/\s?#]+)/);
    if (productsMatch) return true;
  }

  // Check for collection links:
  // - /collections (exact match or end of string)
  // - /collections/ (with trailing slash)
  // - /collections/collection-handle (with collection handle)
  // - Absolute URLs containing /collections (with or without trailing slash)
  // Examples: /collections, /collections/, /collections/abc, https://shop.com/collections, https://shop.com/collections/
  if (normalizedHref.includes("/collections")) {
    // Match: /collections, /collections/, /collections/anything, or ends with /collections
    const collectionsMatch = normalizedHref.match(/\/collections(?:\/|$|\/[^\/\s?#]+)/);
    if (collectionsMatch) return true;
  }

  return false;
};

/**
 * Helper function to check if a URL is external
 */
const isExternalLink = (href, shopShort, shopFull) => {
  if (!href || href.trim() === "" || href === "#") return false;

  // Relative links are not external
  if (href.startsWith("/")) return false;

  // Must be an absolute URL
  const domain = getDomainFromUrl(href);
  if (!domain) return false;

  // External links are absolute URLs that are NOT internal
  return !isInternalLink(href, shopShort, shopFull);
};

export const analyzeLinks = (html, type) => {
  const shopShort = getShopNameShort();
  const shopFull = getShopNameFull();

  if (!html) return { status: "missing", message: "No content", count: 0, badLinks: [] };

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const allLinks = Array.from(doc.querySelectorAll("a[href]"));

  if (allLinks.length === 0 && type === "internal")
    return { status: "missing", message: "Add at least 2-3 internal links.", count: 0, badLinks: [] };
  if (allLinks.length === 0 && type === "external")
    return { status: "missing", message: "Add at least 3-4 external links.", count: 0, badLinks: [] };

  const badLinks = getLinksToFix(html); // collect empty/hash links

  const filteredLinks = allLinks.filter((a) => {
    const href = a.getAttribute("href");
    if (!href || href.trim() === "" || href === "#") return false; // already in badLinks

    if (type === "internal") {
      return isInternalLink(href, shopShort, shopFull);
    }
    if (type === "external") {
      return isExternalLink(href, shopShort, shopFull);
    }
    return false;
  });

  const count = filteredLinks.length;
  let status = "good";
  let message = `${type.charAt(0).toUpperCase() + type.slice(1)} links count: ${count}`;

  if (count === 0) {
    status = "missing";
    if (type === "internal") {
      message = "No internal links found. Add links to your shop's pages, products, or blog posts.";
    } else {
      message = "No external links found. Add links to credible external sources.";
    }
  } else {
    // thresholds: internal <3, external <4
    if ((type === "internal" && count < 3) || (type === "external" && count < 4)) {
      status = "warning";
      const recommended = type === "internal" ? "3" : "4";
      message = `Only ${count} ${type} link(s) found. Recommended: at least ${recommended} ${type} links.`;
    }
  }

  return { status, message, count, badLinks };
};

/**
 * Extended internal links analysis that includes product and collection links
 * Requires at least 2-3 product/collection links
 * If 3+ product/collection links exist, it's okay
 */
export const analyzeInternalLinks = (html) => {
  const shopShort = getShopNameShort();
  const shopFull = getShopNameFull();

  if (!html) return { status: "missing", message: "No content", count: 0, badLinks: [] };

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const allLinks = Array.from(doc.querySelectorAll("a[href]"));

  if (allLinks.length === 0) {
    return { 
      status: "missing", 
      message: "Add at least 3 product/collection links.", 
      count: 0, 
      badLinks: [] 
    };
  }

  const badLinks = getLinksToFix(html); // collect empty/hash links

  // First, identify product/collection links
  const productCollectionLinks = allLinks.filter((a) => {
    const href = a.getAttribute("href");
    return href && href.trim() !== "" && href !== "#" && isProductOrCollectionLink(href);
  });

  // Count internal links that are NOT product/collection links
  // (e.g., /blog, /pages, /about, etc.)
  const internalLinks = allLinks.filter((a) => {
    const href = a.getAttribute("href");
    if (!href || href.trim() === "" || href === "#") return false;
    // Must be internal AND not a product/collection link
    return isInternalLink(href, shopShort, shopFull) && !isProductOrCollectionLink(href);
  });

  const internalCount = internalLinks.length;
  const productCollectionCount = productCollectionLinks.length;
  const totalCount = internalCount + productCollectionCount;

  let status = "good";
  let message = "";

  // If there are 3+ product/collection links, it's okay
  if (productCollectionCount >= 3) {
    status = "good";
    const internalMsg = internalCount > 0 ? `, ${internalCount} internal link(s)` : "";
    message = `${productCollectionCount} product/collection link(s) found${internalMsg}.`;
  }
  // If there are NO product/collection links but there are internal links, show error
  else if (productCollectionCount === 0 && internalCount > 0) {
    status = "missing";
    message = "At least 3 product/collection links must have. Add links to products or collections.";
  }
  // If there are 2 product/collection links, show warning
  else if (productCollectionCount === 2) {
    status = "warning";
    const internalMsg = internalCount > 0 ? `, ${internalCount} internal link(s)` : "";
    message = `Only ${productCollectionCount} product/collection link(s) found${internalMsg}. Recommended: at least 3 product/collection links.`;
  }
  // If there is only 1 product/collection link, show warning
  else if (productCollectionCount === 1) {
    status = "warning";
    const internalMsg = internalCount > 0 ? `, ${internalCount} internal link(s)` : "";
    message = `Only ${productCollectionCount} product/collection link found${internalMsg}. Recommended: at least 3 product/collection links.`;
  }
  // No product/collection links at all
  else {
    status = "missing";
    message = "No product/collection links found. Add at least 3 product/collection links.";
  }

  return { status, message, count: totalCount, badLinks };
};

// Export functions for SEO_CHECKS
export const analyzeExternalLinks = (html) => analyzeLinks(html, "external");
