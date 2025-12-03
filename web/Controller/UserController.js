import Author from "../model/UserModel.js";
import Shop from "../model/ShopModel.js";
const IMAGE_URL = process.env.IMAGE_URL;
import Subscription from "../model/subscriptionModel.js";
import path from 'path';
import sendEmail from "../config/emailHelper.js";
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const getShopFromRequest = (req) => req.shopify?.shop || req.body?.shop || req.query?.shop;




export const CreateAuthor = async (req, res) => {
  try {

    const { name, bio, email, linkedin, twitter, instagram } = req.body;
    const shop = getShopFromRequest(req);

    if (!shop) {
      return res.status(400).json({ success: false, message: "shop is required" });
    }
    // Check if Author already exists by email
    const existing = await Author.findOne({ email: email, shop: shop });
    if (existing) {
      return res.status(400).json({ success: false, message: "Author already exists with this email in this shop" });
    }

        // ✅ Find active subscription for shop
    const subscription = await Subscription.findOne({ shop, status: "ACTIVE"});

    if (!subscription) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found. Please activate a plan.",
      });
    }
    // ✅ If plan is 'pro', apply limit of 3 authors
    if (subscription.planName?.toLowerCase() === "pro") {
      const authorCount = await Author.countDocuments({ shop });
      if (authorCount >= 3) {
        return res.status(400).json({
          success: false,
          message: "Pro plan allows up to 3 authors only. Please upgrade your plan.",
        });
      }
    }
    // ✅ If plan is 'free', apply limit of 1 author
    if (subscription.planName?.toLowerCase() === "free") {
      const authorCount = await Author.countDocuments({ shop });
      if (authorCount >= 1) {
        return res.status(400).json({
          success: false,
          message: "Free plan allows only 1 author. Please upgrade your plan.",
        });
      }
    }
    // ✅ If plan is 'growth', apply limit of 10 authors
    if (subscription.planName?.toLowerCase() === "growth") {
      const authorCount = await Author.countDocuments({ shop });
      if (authorCount >= 10) {
        return res.status(400).json({
          success: false,
          message: "Growth plan allows up to 10 authors only. Please upgrade your plan.",
        });
      }
    }

    // Extract file path if image uploaded
    const image = req.file ? req.file.path : null;

    // Create new Author
    const profile = await Author.create({
      name,
      bio,
      email,
      image,
      linkedin,
      twitter,
      instagram,
      shop
    });

    return res.status(201).json({
      success: true,
      message: "Author created successfully",
      data: profile || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const GetAuthor = async (req, res) => {
  try {
    const userId = req.query.userId; // assuming userId is passed as query param
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId query parameter is required" });
    }

    const profile = await Author.findById({ _id: userId });

    if (!profile) {
      return res.status(200).json({ success: true, message: "Author not found", data: [] });
    }

    return res.status(200).json({ success: true, data: profile || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const GetAllAuthor = async (req, res) => {
  try {
    const shop = getShopFromRequest(req);

    if (!shop)
      return res.status(400).json({ success: false, message: "shop is required" });

    // Fetch all authors with shop details
    const allProfiles = await Author.find({ shop: shop });

    return res.status(200).json({ success: true, message: "Author profiles fetched successfully", data: allProfiles || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const UpdateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, linkedin, twitter, instagram, email } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Author ID is required" });
    }


    // Check if Author exists
    const author = await Author.findOne({ _id: id });
    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found" });
    }

    // Handle image if uploaded
    const image = req.file ? req.file.path : author.image;

    // Update fields
    author.name = name || author.name;
    author.bio = bio || author.bio;
    author.email = email || author.email;
    author.linkedin = linkedin || author.linkedin;
    author.twitter = twitter || author.twitter;
    author.instagram = instagram || author.instagram;
    author.image = image;
    author.is_author_bio_exist = 0;


    const updatedAuthor = await author.save();

    return res.status(200).json({
      success: true,
      message: "Author updated successfully",
      data: updatedAuthor || [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const DeleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = getShopFromRequest(req);

    if (!id || !shop) {
      return res.status(400).json({
        success: false,
        message: "Author ID and shop are required"
      });
    }

    const author = await Author.findOne({ _id: id, shop });
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    await Author.deleteOne({ _id: id, shop });

    return res.status(200).json({
      success: true,
      message: "Author deleted successfully"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// API to send a support email
export const sendSupportEmail = async (req, res) => {
  const { name, email, phone, appUrl, message } = req.body;
  const shop = getShopFromRequest(req);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const templatePath = path.join(__dirname, '../views', 'support-email.ejs');

  // Render the EJS template
    ejs.renderFile(templatePath, { name, email, phone, appUrl, message, shop }, (err, htmlContent) => {
    if (err) {
      console.error('Template rendering error:', err);
      return res.status(500).send('Error rendering email template');
    }
    // ✅ Immediately send response
    res.status(200).json({
      status: true,
      message: "Support request received. Our team will contact you shortly."
    });
    // ✅ Send email in background (don't await it)
    sendEmail(process.env.EMAILUSER , email , `SEOjog App – Support request from ${name}`, htmlContent)
      .then(() => console.log('Email sent statusfully!'))
      .catch(error => console.error('Error sending email:', error));
  });
};