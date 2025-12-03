
import axios from "axios";
import dotenv from "dotenv";
import Shop from "../model/ShopModel.js";
import PostAuthor from "../model/PostAuthor.js";
import Author from "../model/UserModel.js";
dotenv.config();
const IMAGE_URL = process.env.IMAGE_URL;
import { JSDOM } from "jsdom"; // to parse HTML body
import Subscription from "../model/subscriptionModel.js";

const getShopFromRequest = (req) => req.shopify?.shop || req.query?.shop || req.body?.shop;

export const getBlogs = async (req, res) => {
  try {
    let shop = getShopFromRequest(req); // your-shop-name.myshopify.com

    if (!shop) {
      return res.status(400).json({ success: false, message: "Shop parameter is required" });
    }

    const shopData = await Shop.findOne({ shop: shop });

    if (!shopData) {
      return res.status(404).json({ success: false, message: "shop not found" });
    }

    const accessToken = shopData.accessToken;


    // GraphQL query for Admin API
//     const query = `
// {
//   blogs(first: 100) {
//     edges {
//       node {
//         id
//         title
//         handle
//         articles(first: 50) {
//           edges {
//             node {
//               id
//               title
//               body
//               image {
//                 originalSrc
//               }
//               author { name }
//               metafield(namespace: "custom", key: "author_bio") { value }
//               metafields(first: 10, namespace: "seo") {
//                edges {
//                  node {
//                    key
//                    value
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// }
// `;

const query = `
{
blogs(first: 100) {
edges {
  node {
    id
    title
    handle
    articles(first: 50) {
      edges {
        node {
          id
          title
          body
          tags
          image {
            originalSrc
          }
          author { name }
          metafield(namespace: "custom", key: "author_bio") { value }
          metafields(first: 50) {
            edges {
              node {
                key
                value
              }
            }
          }
          blog { id title handle }
        }
      }
    }
  }
}
}
}
`;

    const response = await axios.post(
      `https://${shop}/admin/api/2025-10/graphql.json`,
      { query },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    const blogs = response.data;
    const blogs1 = response.data?.data?.blogs?.edges || [];


    if (!blogs) {
      return res.status(200).json({ success: true, message: "No blogs found", data: [] });
    }

    // Process and save authors
    for (const blog of blogs1) {
      const blogNode = blog.node;
      const articles = blogNode.articles?.edges || [];

for (const article of articles) {
  const art = article.node;
  const authorName = art.author?.name?.trim() || "";

  const authorDoc = await Author.findOneAndUpdate(
    { shop, name: authorName },
    { shop, name: authorName,is_defaut_author:true},
    { upsert: true, new: true }
  );

  const recordExists = await PostAuthor.findOne({
    shop,
    blogId: blogNode.id,
    articleId: art.id,
  });

  if (!recordExists) {
    const record = {
      shop,
      blogId: blogNode.id,
      articleId: art.id,
      authorId: authorDoc._id,
    };
    await PostAuthor.create(record);
  }
} }
    return res.json({ success: true, message: "✅ Blogs fetched successfully", data: blogs || [] });
  } catch (error) {
    console.error("❌ Error fetching admin blogs:", error.response?.data || error);
    return res.status(500).json({ success: false, message: "Failed to fetch admin blogs" });
  }
};

export const getBlogsById = async (req, res) => {
  try {
    const shop = getShopFromRequest(req);
    const { id: articleId } = req.query;
    if (!shop || !articleId) {
      return res.status(400).json({ success: false, message: "Shop and Article ID are required" });
    }

    const shopData = await Shop.findOne({ shop });
    if (!shopData) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const accessToken = shopData.accessToken;

    const query = `
      query GetArticleById($id: ID!) {
        article(id: $id) {
          id
          title
          body
          tags
          image { originalSrc }
          author { name }
          metafield(namespace: "custom", key: "author_bio") { value }
          metafields(first: 50) {
            edges {
              node {
                key
                value
              }
            }
          }
          blog { id title handle }
        }
      }
    `;

    const response = await axios.post(
      `https://${shop}/admin/api/2025-10/graphql.json`,
      { query, variables: { id: articleId } },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    const article = response.data?.data?.article;
    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    const authorBio = article.metafield?.value || null;

    // ✅ Extract latest title_tag & description_tag from metafields
    let titleTags = article.metafields?.edges?.filter(m => m.node.key === "title_tag") || [];
    let descriptionTags = article.metafields?.edges?.filter(m => m.node.key === "description_tag") || [];

    let latestTitle = titleTags[titleTags.length - 1];
    let latestDescription = descriptionTags[descriptionTags.length - 1];

    // ✅ Build new metafields array with renamed keys
    let newEdges = [];

    if (latestTitle) {
      newEdges.push({
        node: {
          key: "metaTitle",
          value: latestTitle.node.value
        }
      });
    }

    if (latestDescription) {
      newEdges.push({
        node: {
          key: "metaDescription",
          value: latestDescription.node.value
        }
      });
    }

    // ✅ Replace original metafields in response
    article.metafields.edges = newEdges;

    const metaTitle = latestTitle ? latestTitle.node.value : article.title;
    const metaDescription = latestDescription ? latestDescription.node.value : "";

    return res.json({
      success: true,
      message: "✅ Article fetched successfully",
      data: {
        ...article,
        author: {
          ...article.author,
          bio: authorBio
        },
        seo: {
          title: metaTitle,
          description: metaDescription
        }
      }
    });

  } catch (error) {
    console.error("❌ Error fetching article by ID:", error.response?.data || error);
    return res.status(500).json({ success: false, message: "Failed to fetch article by ID" });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const shop = getShopFromRequest(req);
    const {
      id,
      blog_id,
      title,
      body_html,
      tags,
      metaTitle,
      metaDescription
    } = req.body;

    if (!id || !blog_id) {
      return res.status(400).json({
        success: false,
        message: "Article ID and Blog ID are required",
      });
    }

    // ✅ Add validation for numeric ID extraction
    const getNumericId = (gid) => {
      if (!gid || typeof gid !== 'string') {
        throw new Error("Invalid GID format");
      }
      const parts = gid.split("/");
      if (parts.length === 0) {
        throw new Error("Invalid GID format");
      }
      return parts.pop();
    };

    let numericArticleId, numericBlogId;
    try {
      numericArticleId = getNumericId(id);
      numericBlogId = getNumericId(blog_id);
    } catch (idError) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${idError.message}`,
      });
    }

    const shopData = await Shop.findOne({ shop });
    if (!shopData)
      return res.status(404).json({ success: false, message: "Shop not found" });

    const accessToken = shopData.accessToken;

    // ✅ Check subscription
    const subscription = await Subscription.findOne({ shop, status: "ACTIVE" });
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "No active plan found. Please upgrade your plan.",
      });
    }

    let planLimit = 3;
    if (subscription.planName === "pro") planLimit = 20;
    if (subscription.planName === "growth") planLimit = 100;

    const now = new Date();
    const lastReset = subscription.lastReset || now;
    const monthDiff =
      now.getMonth() - new Date(lastReset).getMonth() +
      12 * (now.getFullYear() - new Date(lastReset).getFullYear());

    if (monthDiff >= 1) {
      try {
        subscription.blogCount = 0;
        subscription.lastReset = now;
        await subscription.save();
      } catch (resetError) {
        console.error("Failed to reset subscription count:", resetError);
        // Continue anyway, but log error
      }
    }

    if (subscription.blogCount >= planLimit) {
      return res.status(400).json({
        success: false,
        message: `You’ve reached your monthly blog limit (${planLimit}).`,
      });
    }

    // ✅ Build article update payload (REST) with validation
    const articlePayload = {};
    
    if (title) {
      if (title.length > 255) {
        return res.status(400).json({
          success: false,
          message: "Title must be 255 characters or less"
        });
      }
      articlePayload.title = title.trim();
    }
    
    if (body_html) {
      articlePayload.body_html = body_html; // Note: Consider HTML sanitization for production
    }
    
    if (tags) {
      // ✅ Validate tags
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: "Tags must be an array"
        });
      }
      
      // ✅ Sanitize and limit tags
      articlePayload.tags = tags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => tag.trim().substring(0, 50)) // Limit length
        .slice(0, 10); // Limit count
    }

    // ✅ Featured image
    if (req.body.image) {
      articlePayload.image = { src: req.body.image };
    }
    // ✅ Update via REST
    if (Object.keys(articlePayload).length > 0) {
      await axios.put(
        `https://${shop}/admin/api/2025-10/blogs/${numericBlogId}/articles/${numericArticleId}.json`,
        { article: articlePayload },
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
          timeout: 30000, // ✅ Add 30 second timeout
        }
      );
    }

    // ✅ Save metafields for AVADA SEO override with error handling
    const seoMutation = `
mutation articleMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id }
    userErrors { field message }
  }
}`;

    const API_VERSION = process.env.LATEST_API_VERSION || "2025-10";
    
    try {
      const metafieldsResponse = await axios.post(
        `https://${shop}/admin/api/${API_VERSION}/graphql.json`,
        {
          query: seoMutation,
          variables: {
            metafields: [
              {
                ownerId: id,
                namespace: "global",
                key: "title_tag",
                value: (metaTitle || title)?.substring(0, 60) || title, // ✅ Limit to 60 chars
                type: "single_line_text_field"
              },
              {
                ownerId: id,
                namespace: "global",
                key: "description_tag",
                value: metaDescription?.substring(0, 160) || "", // ✅ Limit to 160 chars
                type: "multi_line_text_field"
              }
            ]
          }
        },
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json"
          },
          timeout: 30000, // ✅ Add 30 second timeout
        }
      );

      // ✅ Check for errors
      if (metafieldsResponse.data.errors) {
        console.error("Metafields mutation errors:", metafieldsResponse.data.errors);
      }

      if (metafieldsResponse.data.data?.metafieldsSet?.userErrors?.length > 0) {
        console.error("Metafields userErrors:", metafieldsResponse.data.data.metafieldsSet.userErrors);
      }
    } catch (metafieldsError) {
      console.error("Failed to set metafields:", metafieldsError);
      // Don't fail the whole request if metafields fail
    }

    // ✅ Increase blog count
    try {
      subscription.blogCount = (subscription.blogCount || 0) + 1;
      await subscription.save();
    } catch (countError) {
      console.error("Failed to increment blog count:", countError);
      // Log but don't fail the request
    }

    return res.json({
      success: true,
      message: "✅ Article updated successfully",
      used: subscription.blogCount,
      limit: planLimit,
    });

  } catch (error) {
    console.error("❌ Error updating article:", error.response?.data || error);
    res.status(500).json({ success: false, message: "Failed to update article" });
  }
};

export const getBlogsForAssignAuthor = async (req, res) => {
  try {
    let shop = getShopFromRequest(req); // your-shop-name.myshopify.com

    if (!shop) {
      return res.status(400).json({ success: false, message: "Shop parameter is required" });
    }

    const shopData = await Shop.findOne({ shop: shop });

    if (!shopData) {
      return res.status(404).json({ success: false, message: "shop not found" });
    }

    const accessToken = shopData.accessToken;


    // GraphQL query for Admin API
    const query = `
{
  blogs(first: 100) {
    edges {
      node {
        id
        title
        handle
        articles(first: 50) {
          edges {
            node {
              id
              title
              body
              image {
                originalSrc
              }
              author { name }
              metafield(namespace: "custom", key: "author_bio") { value }
              metafields(first: 10, namespace: "seo") {
               edges {
                 node {
                   key
                   value
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

    const response = await axios.post(
      `https://${shop}/admin/api/2025-10/graphql.json`,
      { query },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    const blogs = response.data;
    const blogs1 = response.data?.data?.blogs?.edges || [];


    if (!blogs) {
      return res.status(200).json({ success: true, message: "No blogs found", data: [] });
    }

    // Process and save authors
    for (const blog of blogs1) {
      const blogNode = blog.node;
      const articles = blogNode.articles?.edges || [];

for (const article of articles) {
  const art = article.node;
  const authorName = art.author?.name?.trim() || "";

  const authorDoc = await Author.findOneAndUpdate(
    { shop, name: authorName },
    { shop, name: authorName,is_defaut_author:true},
    { upsert: true, new: true }
  );

  const recordExists = await PostAuthor.findOne({
    shop,
    blogId: blogNode.id,
    articleId: art.id,
  });

  if (!recordExists) {
    const record = {
      shop,
      blogId: blogNode.id,
      articleId: art.id,
      authorId: authorDoc._id,
    };
    await PostAuthor.create(record);
  }
} }
    return res.json({ success: true, message: "✅ Blogs fetched successfully", data: blogs || [] });
  } catch (error) {
    console.error("❌ Error fetching admin blogs:", error.response?.data || error);
    return res.status(500).json({ success: false, message: "Failed to fetch admin blogs" });
  }
};


