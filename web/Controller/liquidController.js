

import PostAuthor from "../model/PostAuthor.js";
import Author from "../model/UserModel.js";
import shopify from "../shopify.js";
import axios from "axios";
import Shop from "../model/ShopModel.js";
import Subscription from "../model/subscriptionModel.js";

const getShopFromRequest = (req) => req.shopify?.shop || req.body?.shop || req.query?.shop;
const sanitizeAttr = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export async function assignAuthorToBlog(shop, blogId, articleId, authorId) {
  const shopData = await Shop.findOne({ shop });
  const IMG_API_BASE = "https://app.seojog.app";
  if (!shopData) return { success: false, message: "Shop not found" };
  const SHOPIFY_ACCESS_TOKEN = shopData.accessToken;

  const profile = await Author.findById({ _id: authorId });

  if (!profile) {
    return { success: false, message: "Author not found" };
  }

  const cleanArticleId = articleId.includes("gid://") ? articleId.split("/").pop() : articleId;

  // 🔹 Fetch current article
  const { data } = await axios.get(
    `https://${shop}/admin/api/2025-10/articles/${cleanArticleId}.json`,
    { headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN } }
  );

  let body = data.article.body_html || "";

  // ✅ Remove all existing author blocks (handles newlines and attributes)
  body = body.replace(/<div\b[^>]*class=["'][^"']*\bbloggle-author\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");

  // ✅ Add the new author block
  const placeholder = `
<div class="bloggle-author"
     data-author-id="${sanitizeAttr(authorId)}"
     data-author-name="${sanitizeAttr(profile.name || "")}"
     data-author-bio="${sanitizeAttr(profile.bio || "")}"
     data-author-image="${sanitizeAttr(`${IMG_API_BASE}/${profile.image}` || "")}"
     data-author-linkedin="${sanitizeAttr(profile.linkedin || "")}"
     data-author-twitter="${sanitizeAttr(profile.twitter || "")}"
     data-author-instagram="${sanitizeAttr(profile.instagram || "")}">
</div>`;

  body += placeholder;

  // 🔹 Update article
  await axios.put(
    `https://${shop}/admin/api/2025-10/articles/${cleanArticleId}.json`,
    { article: { body_html: body } },
    { headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN } }
  );

  // 🔹 Save author in DB (update or create)
  let postAuthor = await PostAuthor.findOne({ articleId, shop });
  // 🔹 STEP 1: Set all authors of this shop to false
  await Author.updateMany({ shop, is_assign: true }, { $set: { is_assign: false } });
  // 🔹 STEP 2: Set current author to true
  await Author.findByIdAndUpdate(authorId, { is_assign: true }, { new: true });

  if (postAuthor) {
    postAuthor.authorId = authorId;
    postAuthor.is_assign = true;
    await postAuthor.save();
    return { success: true, message: "Assigned author updated successfully" };
  } else {
    postAuthor = new PostAuthor({ shop, blogId, articleId, authorId, is_assign: true });
    await postAuthor.save();
    return { success: true, message: "Author assigned successfully" };
  }
}



// controllers/liquidController.js
export const generateLiquidSnippetController = async (req, res) => {
  try {
    const { blogId, articleId, authorId } = req.body;
    const shop = getShopFromRequest(req);
    if (!shop || !blogId || !articleId || !authorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Find active subscription for shop
    const subscription = await Subscription.findOne({ shop, status: "ACTIVE" });

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found. Please activate a plan.",
      });
    }
    // ✅ If plan is 'free', apply limit of 1 author
    if (subscription.planName?.toLowerCase() === "free") {
      const authorCount = await PostAuthor.countDocuments({ shop , is_assign: true });
      if (authorCount >= 3) {
        return res.status(400).json({
          success: false,
          message: "You’ve reached your free plan assigned 3 authors limit. Please upgrade your plan.",
        });
      }
    }

    // 🔸 Assign author to the article/blog
    const snippet = await assignAuthorToBlog(shop, blogId, articleId, authorId);
    if (!snippet?.success) {
      return res.status(400).json({ error: snippet?.message || "Failed to assign author" });
    }

    return res.status(200).json({
      success: true,
      message: "Liquid snippet generated successfully",
      snippet,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate Liquid snippet" });
  }
};


export const getAllAssignAuthor = async (req, res) => {
  try {
    const { shop, articleId, blogId } = req.query;

    if (!shop) {
      return res.status(400).json({ success: false, message: "Shop is required" });
    }

    // Build query
    let query = { shop };
    if (articleId) query.articleId = articleId;
    if (blogId) query.blogId = blogId;

    const authors = await PostAuthor.find(query);

    if (!authors || authors.length === 0) {
      return res.status(404).json({ success: false, message: "No authors found" });
    }

    const authorsData = await Author.findOne({ _id: authors[0].authorId });

    return res.status(200).json({ success: true, authorsData });
  } catch (error) {
    console.error("Get Author Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// GetAllAssignAuthorBy ID
export const GetAllAssignAuthorBy = async (req, res) => {
  try {
    const id = req.query.id; // assuming id is passed as query param
    if (!id) {
      return res.status(400).json({ success: false, message: "id query parameter is required" });
    }

    const authors = await PostAuthor.find({ authorId: id });

    if (!authors || authors.length === 0) {
      return res.status(404).json({ success: false, message: "No authors found" });
    }

    const profile = await Author.findById({ _id: authors[0].authorId });

    if (!profile) {
      return res.status(200).json({ success: true, message: "Author not found", data: [] });
    }

    return res.status(200).json({ success: true, data: profile || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// New function to assign author and update blog's default author name
export async function assignAuthorAndUpdateBlogAuthor(shop, blogId, articleId, authorId) {
  const shopData = await Shop.findOne({ shop });
  const IMG_API_BASE = "https://app.seojog.app";
  if (!shopData) return { success: false, message: "Shop not found" };
  const SHOPIFY_ACCESS_TOKEN = shopData.accessToken;

  const profile = await Author.findById({ _id: authorId });

  if (!profile) {
    return { success: false, message: "Author not found" };
  }

  const cleanArticleId = articleId.includes("gid://") ? articleId.split("/").pop() : articleId;
  const cleanBlogId = blogId.includes("gid://") ? blogId.split("/").pop() : blogId;

  // 🔹 Fetch current article
  const { data } = await axios.get(
    `https://${shop}/admin/api/2025-10/blogs/${cleanBlogId}/articles/${cleanArticleId}.json`,
    { headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN } }
  );

  let body = data.article.body_html || "";

  // ✅ Remove all existing author blocks (handles newlines and attributes)
  body = body.replace(/<div\b[^>]*class=["'][^"']*\bbloggle-author\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");

  // ✅ Add the new author block
  const placeholder = `
<div class="bloggle-author"
     data-author-id="${sanitizeAttr(authorId)}"
     data-author-name="${sanitizeAttr(profile.name || "")}"
     data-author-bio="${sanitizeAttr(profile.bio || "")}"
     data-author-image="${sanitizeAttr(`${IMG_API_BASE}/${profile.image}` || "")}"
     data-author-linkedin="${sanitizeAttr(profile.linkedin || "")}"
     data-author-twitter="${sanitizeAttr(profile.twitter || "")}"
     data-author-instagram="${sanitizeAttr(profile.instagram || "")}">
</div>`;

  body += placeholder;

  // 🔹 Update article with both body_html and author name
  await axios.put(
    `https://${shop}/admin/api/2025-10/blogs/${cleanBlogId}/articles/${cleanArticleId}.json`,
    { 
      article: { 
        body_html: body,
        author: profile.name || "" // Update the default author name
      } 
    },
    { headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN } }
  );

  // 🔹 Save author in DB (update or create)
  let postAuthor = await PostAuthor.findOne({ articleId, shop });
  // 🔹 STEP 1: Set all authors of this shop to false
  await Author.updateMany({ shop, is_assign: true }, { $set: { is_assign: false } });
  // 🔹 STEP 2: Set current author to true
  await Author.findByIdAndUpdate(authorId, { is_assign: true }, { new: true });

  if (postAuthor) {
    postAuthor.authorId = authorId;
    postAuthor.is_assign = true;
    await postAuthor.save();
    return { success: true, message: "Assigned author updated successfully" };
  } else {
    postAuthor = new PostAuthor({ shop, blogId, articleId, authorId, is_assign: true });
    await postAuthor.save();
    return { success: true, message: "Author assigned successfully" };
  }
}

// New api for assigning author and updating blog author name
export const assignAuthorAndUpdateBlogAuthorController = async (req, res) => {
  try {
    const {blogId, articleId, authorId } = req.body;
    const shop = getShopFromRequest(req);
    if (!shop || !blogId || !articleId || !authorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Find active subscription for shop
    const subscription = await Subscription.findOne({ shop, status: "ACTIVE" });

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found. Please activate a plan.",
      });
    }
    // ✅ If plan is 'free', apply limit of 1 author
    // let authorLimit = null;
    // const planName = subscription.planName?.toLowerCase();
    // if (planName === "free") {
    //   authorLimit = 3;
    // } else if (planName === "pro") {
    //   authorLimit = 20;
    // } else if (planName === "growth") {
    //   authorLimit = 100;
    // }

    // if (authorLimit !== null) {
    //   const authorCount = await PostAuthor.countDocuments({ shop, is_assign: true });
    //   if (authorCount >= authorLimit) {
    //     return res.status(400).json({
    //       success: false,
    //       message: `You've reached your ${subscription.planName} plan assigned ${authorLimit} authors limit. Please upgrade your plan.`,
    //     });
    //   }
    // }

    // 🔸 Assign author to the article/blog and update author name
    const result = await assignAuthorAndUpdateBlogAuthor(shop, blogId, articleId, authorId);
    if (!result?.success) {
      return res.status(400).json({ error: result?.message || "Failed to assign author" });
    }

    return res.status(200).json({
      success: true,
      message: "Author assigned and blog author name updated successfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to assign author and update blog author name" });
  }
};