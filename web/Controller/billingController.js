import fetch from "node-fetch";
import Subscription from "../model/subscriptionModel.js";
import Shop from "../model/ShopModel.js";
import dotenv from "dotenv";
dotenv.config();

const API_VERSION = process.env.LATEST_API_VERSION || "2025-10";
const HOST = process.env.HOST;

// ✅ Validate HOST environment variable
if (!HOST) {
  throw new Error("Missing HOST environment variable. Required for billing callbacks.");
}

/**
 * Helper to get access token of shop from DB or session
 */
async function getAccessTokenForShop(shop) {
  // 👇 Tum apni auth logic lagao — yahan demo ke liye env me rakha hai
  return process.env.SHOPIFY_ACCESS_TOKEN;
}

const resolveShop = (req) => req.shopify?.shop || req.body?.shop || req.query?.shop;

export const createSubscription = async (req, res) => {
  try {
    const shop = resolveShop(req);
    const { plan } = req.body;
    
    // ✅ Enhanced shop validation
    if (!shop || typeof shop !== 'string') {
      return res.status(400).json({ error: "Valid shop parameter is required" });
    }

    if (!shop.includes('.myshopify.com')) {
      return res.status(400).json({ error: "Invalid shop domain format" });
    }

    if (!plan || !['free', 'pro', 'growth', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: "Valid plan is required. Must be one of: free, pro, growth, enterprise" });
    }

    const shopData = await Shop.findOne({ shop });
    if (!shopData) {
      return res.status(404).json({ error: "Shop not found. Please reinstall the app." });
    }

    // ✅ FREE PLAN
    if (plan === "free") {
      try {
        await Subscription.findOneAndUpdate(
          { shop },
          {
            shop,
            planName: "free",
            subscriptionId: null,
            status: "ACTIVE",
            createdAt: new Date(),
            expiresAt: null, // No expiry for free plan
            is_install: true,
          },
          { upsert: true }
        );
        return res.json({ message: "Free plan activated!", confirmationUrl: null });
      } catch (dbError) {
        console.error("Failed to activate free plan:", dbError);
        return res.status(500).json({ error: "Failed to activate free plan. Please try again." });
      }
    }

    // ✅ PAID PLANS
    const planMap = {
      pro: { amount: 10, interval: "EVERY_30_DAYS" },
      growth: { amount: 20, interval: "EVERY_30_DAYS" },
      enterprise: { amount: 249, interval: "EVERY_30_DAYS" },
    };

    const planDetails = planMap[plan];
    if (!planDetails) return res.status(400).json({ error: "Invalid plan" });

    const accessToken = shopData.accessToken;

    const query = `
      mutation appSubscriptionCreate($name: String!, $returnUrl: URL!,$test: Boolean!, $lineItems: [AppSubscriptionLineItemInput!]!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          test: $test
          lineItems: $lineItems
        ) {
          appSubscription {
            id
            name
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }
    `;

      const allowTestFlag = process.env.SHOPIFY_BILLING_TEST === "true" || process.env.NODE_ENV !== "production";
      const isTestCharge = allowTestFlag && req.query?.test === "true";

      const variables = {
      name: `${plan} plan`,
      returnUrl: `${HOST}/api/billing/callback?shop=${shop}`,
        test: isTestCharge, // ✅ Dynamic based on environment
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: { amount: planDetails.amount, currencyCode: "USD" },
              interval: planDetails.interval,
            },
          },
        },
      ],
    };

    // ✅ Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    let response;
    try {
      response = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal, // ✅ Add timeout
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: "Request timeout. Please try again." });
      }
      throw fetchError;
    }

    // ✅ Check response status before parsing
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Shopify API error: ${response.statusText}` 
      });
    }

    const text = await response.text();
    if (!text) return res.status(500).json({ error: "Empty response from Shopify" });

    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse Shopify response:", err, "Raw:", text);
      return res.status(500).json({ error: "Invalid response from Shopify" });
    }

    // ✅ Enhanced GraphQL error handling
    // Check for GraphQL errors first
    if (json.errors && json.errors.length > 0) {
      console.error("GraphQL errors:", json.errors);
      return res.status(500).json({ 
        error: "Shopify API error", 
        details: json.errors.map(e => e.message).join(", ")
      });
    }

    const data = json.data?.appSubscriptionCreate;
    if (!data) {
      return res.status(500).json({ error: "Unexpected response from Shopify" });
    }

    if (data.userErrors && data.userErrors.length > 0) {
      return res.status(400).json({ 
        error: "Subscription creation failed",
        userErrors: data.userErrors 
      });
    }

    if (!data.appSubscription?.id) {
      return res.status(500).json({ error: "Subscription ID not returned from Shopify" });
    }

    // ✅ Save as PENDING with expiry date (30 days ahead)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // ✅ Validate date
    if (isNaN(expiresAt.getTime())) {
      console.error("Invalid expiry date calculated");
      expiresAt = null; // Fallback
    }

    try {
      await Subscription.findOneAndUpdate(
        { shop },
        {
          shop,
          planName: plan,
          subscriptionId: data.appSubscription.id,
          status: "PENDING",
          createdAt: new Date(),
          expiresAt,
          is_install: true,
        },
        { upsert: true }
      );
    } catch (dbError) {
      console.error("Failed to save subscription:", dbError);
      // Still return confirmation URL, subscription will be updated via webhook
    }

    return res.json({
      confirmationUrl: data.confirmationUrl,
      message: "Redirect merchant to Shopify confirmation URL",
    });
  } catch (err) {
    console.error("❌ Subscription error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getActivePlan = async (req, res) => {
  try {
    const shop = resolveShop(req);
    
    // ✅ Enhanced shop validation
    if (!shop || typeof shop !== 'string') {
      return res.status(400).json({ error: "Valid shop parameter is required" });
    }

    if (!shop.includes('.myshopify.com')) {
      return res.status(400).json({ error: "Invalid shop domain format" });
    }

    const shopData = await Shop.findOne({ shop });
    if (!shopData) {
      return res.status(404).json({ error: "Shop not found. Please reinstall the app." });
    }

    const subscription = await Subscription.findOne({ shop, status: { $in: ["ACTIVE", "PENDING" , "EXPIRED"]} }); // ✅ Only active subscriptions

    if (!subscription) {
      return res.status(200).json({ status:true,message:"active plan not found",data:[]  });
    }

    return res.status(200).json({status:true,message:"successfully get the active plan ",data:subscription });
  } catch (err) {
    console.error("Get active plan error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};



