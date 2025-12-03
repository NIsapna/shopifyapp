

import express from "express";
import { join } from "path";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUI from "swagger-ui-express";
import connectDB from "./config/db.js";
import swaggerSpec from "./config/swagger.js";
import shopify from "./shopify.js";
import Shop from "./model/ShopModel.js";
import cookieParser from "cookie-parser";
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DeliveryMethod } from "@shopify/shopify-api";
import blogRoutes from "./Route/BlogRoute.js";
import userRoutes from "./Route/UserRoute.js";
import shopRoutes from "./Route/ShopRoute.js";
import handleErrors from "./middleware/errorHandler.js";
import path from "path";
import billingRoutes from "./Route/billingRoute.js";
import Subscription from "./model/subscriptionModel.js";
import liquidRoutes from "./Route/liquidRoute.js";
import requireShopifySession from "./middleware/requireShopifySession.js";
import purgeShopData from "./utils/purgeShopData.js";
import axios from "axios";
import PostAuthor from "./model/PostAuthor.js";
import cron from "node-cron";

dotenv.config();
connectDB();

// ✅ Validate required environment variables
const requiredEnvVars = [
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET',
  'SHOPIFY_HOST_NAME',
  'DataBaseUrl',
  'HOST'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please set these variables in your .env file or environment');
  process.exit(1);
}

// Validate that critical vars are not empty strings
const emptyVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');
if (emptyVars.length > 0) {
  console.error('❌ Empty environment variables detected:', emptyVars);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4500;
const api_key = process.env.SHOPIFY_API_KEY;
const api_secret = process.env.SHOPIFY_API_SECRET;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STATIC_PATH = process.env.NODE_ENV === "production"
  ? join(__dirname, "client", "dist")
  : join(__dirname, "client");

app.set("trust proxy", 1);
const DATA_RETENTION_HOURS = Number(process.env.SHOP_DATA_RETENTION_HOURS || 0);
const defaultCorsOrigins = [
  "https://admin.shopify.com",
  process.env.SHOPIFY_HOST_NAME ? `https://${process.env.SHOPIFY_HOST_NAME}` : null,
].filter(Boolean);
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigins = allowedOrigins.length ? allowedOrigins : defaultCorsOrigins;

async function deleteShopDataWithGrace(shop) {
  if (!shop) return;
  if (DATA_RETENTION_HOURS > 0) {
    const delay = DATA_RETENTION_HOURS * 60 * 60 * 1000;
    setTimeout(() => purgeShopData(shop).catch((err) => console.error("Delayed purge failed", err)), delay);
    console.info(`Scheduled data purge for ${shop} in ${DATA_RETENTION_HOURS}h`);
  } else {
    await purgeShopData(shop);
  }
}

/* ---------------------------------------------------
   ✅ RAW BODY FOR SHOPIFY WEBHOOKS (before JSON)
--------------------------------------------------- */
app.use('/api/webhooks', express.raw({
  type: 'application/json',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// ✅ Reject GET/PUT/etc with 404 (Shopify review requirement)
app.all("/api/webhooks", (req, res, next) => {
  if (req.method !== "POST") {
    return res.status(404).send("Not Found");
  }
  next();
});


/* ---------------------------------------------------
   ✅ SHOPIFY WEBHOOK VERIFICATION
--------------------------------------------------- */
function verifyShopifyWebhook(req, res, next) {
  try {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    if (!hmacHeader || !req.rawBody) {
      return res.status(401).send('Missing HMAC or body');
    }

    const generatedHash = crypto
      .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
      .update(req.rawBody, 'utf8')
      .digest('base64');

    if (generatedHash === hmacHeader) {
      console.log('✅ Webhook verified');
      next();
    } else {
      console.log('❌ Invalid HMAC');
      res.status(401).send('HMAC verification failed');
    }
  } catch (err) {
    console.error('Webhook verification error:', err);
    res.status(401).send('Verification error');
  }
}

/* ---------------------------------------------------
   ✅ WEBHOOK ROUTES
--------------------------------------------------- */
// ✅ Main webhook handler (already has raw body middleware from app.use above)
app.post('/api/webhooks', verifyShopifyWebhook, async (req, res) => {
  try {
    const topic = req.get("X-Shopify-Topic");
    const shop = req.get("X-Shopify-Shop-Domain");
    if (topic === "app/uninstalled") {
      console.log("🧹 Running uninstall cleanup...");
      await deleteShopDataWithGrace(shop);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Error in main webhook handler:', err);
    res.sendStatus(200); // Always return 200 to Shopify
  }
});

// ✅ Privacy webhooks with HMAC verification
app.post('/api/webhooks/shop/redact', express.raw({ type: 'application/json' }), verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.get("X-Shopify-Shop-Domain");
    console.log('✅ Received shop/redact webhook for:', shop);
    await deleteShopDataWithGrace(shop);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error in shop/redact:', err);
    res.sendStatus(200); // Always return 200 to Shopify
  }
});

app.post('/api/webhooks/customers/redact', express.raw({ type: 'application/json' }), verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.get("X-Shopify-Shop-Domain");
    console.log('✅ Received customers/redact webhook for:', shop);
    // Implement customer data deletion if you store customer data
    res.sendStatus(200);
  } catch (err) {
    console.error('Error in customers/redact:', err);
    res.sendStatus(200);
  }
});

app.post('/api/webhooks/customers/data_request', express.raw({ type: 'application/json' }), verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.get("X-Shopify-Shop-Domain");
    console.log('✅ Received customers/data_request webhook for:', shop);
    // Implement customer data export if you store customer data
    res.sendStatus(200);
  } catch (err) {
    console.error('Error in customers/data_request:', err);
    res.sendStatus(200);
  }
});

app.post('/api/webhooks/app/uninstalled', express.raw({ type: 'application/json' }), verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.get("X-Shopify-Shop-Domain");
    console.log('✅ Received uninstalled webhook for:', shop);
    await deleteShopDataWithGrace(shop);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error in app/uninstalled:', err);
    res.sendStatus(200);
  }
});

/* -------------------------------
   BILLING CALLBACK
------------------------------- */
app.get("/api/billing/callback", async (req, res) => {
 try {
    console.log("/api/billing/callback =================================");
    const { shop } = req.query;
    if (!shop) return res.status(400).send("Shop is required");

    const shopData = await Shop.findOne({ shop });
    if (!shopData) return res.status(404).send("Shop not found");

    const subscription = await Subscription.findOne({ shop });
    if (!subscription || subscription.status !== "PENDING")
      return res.status(400).send("No pending subscription found");

    // ---------------------------
    // Free plan → activate directly
    // ---------------------------
    if (!subscription.subscriptionId) {
      console.log("Free plan detected. Activating subscription.");
      subscription.status = "ACTIVE";
      subscription.planName = subscription.planName || "free";
      await subscription.save();
      return res.send(`
        <h2>✅ Billing Complete</h2>
        <p>Your free plan subscription is now active for ${shop}.</p>
      `);
    }

    // ---------------------------
    // Paid plan → verify Shopify status
    // ---------------------------
    const query = `
      {
        node(id: "${subscription.subscriptionId}") {
          ... on AppSubscription {
            status
          }
        }
      }
    `;

    // ✅ Enhanced error handling for fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    let response;
    try {
      response = await fetch(
        `https://${shop}/admin/api/${process.env.LATEST_API_VERSION || "2025-10"}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": shopData.accessToken,
          },
          body: JSON.stringify({ query }),
          signal: controller.signal, // ✅ Add timeout
        }
      );
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Billing Error</title></head>
          <body>
            <h2>⚠️ Error</h2>
            <p>Request timeout. Please try again or contact support.</p>
          </body>
          </html>
        `);
      }
      console.error("Network error in billing callback:", fetchError);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Billing Error</title></head>
        <body>
          <h2>⚠️ Error</h2>
          <p>Network error while verifying subscription. Please try again or contact support.</p>
        </body>
        </html>
      `);
    }

    if (!response.ok) {
      console.error(`Shopify API returned ${response.status}: ${response.statusText}`);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Billing Error</title></head>
        <body>
          <h2>⚠️ Error</h2>
          <p>Error verifying subscription with Shopify. Please try again or contact support.</p>
        </body>
        </html>
      `);
    }

    const text = await response.text();
    if (!text) {
      console.error("Shopify response body is empty");
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Billing Error</title></head>
        <body>
          <h2>⚠️ Error</h2>
          <p>Empty response from Shopify. Please try again.</p>
        </body>
        </html>
      `);
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse Shopify response:", parseErr, "Raw:", text);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Billing Error</title></head>
        <body>
          <h2>⚠️ Error</h2>
          <p>Invalid response from Shopify. Please try again.</p>
        </body>
        </html>
      `);
    }

    const status = json.data?.node?.status;

    if (!status) {
      console.log("Shopify subscription status not found.");
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Billing Error</title></head>
        <body>
          <h2>⚠️ Error</h2>
          <p>Subscription status not found. Please contact support.</p>
        </body>
        </html>
      `);
    }

    switch (status) {
      case "ACTIVE":
        subscription.status = "ACTIVE";
        await subscription.save();
        // ✅ Safe redirect with fallback
        try {
          const shopName = shop.replace('.myshopify.com', '');
          if (!shopName || shopName === shop) {
            // Fallback if shop format is unexpected
            return res.send(`
              <!DOCTYPE html>
              <html>
              <head><title>Billing Complete</title></head>
              <body>
                <h2>✅ Billing Complete</h2>
                <p>Your subscription is now active for ${shop}.</p>
                <p><a href="https://admin.shopify.com/store/${shop}/apps/seojog">Click here to return to the app</a></p>
                <script>
                  setTimeout(function() {
                    window.location.href = "https://admin.shopify.com/store/${shop}/apps/seojog";
                  }, 2000);
                </script>
              </body>
              </html>
            `);
          }
          return res.redirect(`https://admin.shopify.com/store/${shopName}/apps/seojog`);
        } catch (err) {
          console.error("Redirect error:", err);
          return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Billing Complete</title></head>
            <body>
              <h2>✅ Billing Complete</h2>
              <p>Your subscription is now active. Please return to the app manually.</p>
              <p><a href="https://admin.shopify.com/store/${shop}/apps/seojog">Return to App</a></p>
            </body>
            </html>
          `);
        }

      case "PENDING":
        return res.send(`
          <h2>⏳ Subscription Pending</h2>
          <p>Please complete confirmation in Shopify for ${shop}.</p>
        `);

      case "CANCELLED":
      case "EXPIRED":
        subscription.status = status;
        await subscription.save();
        return res.send(`
          <h2>⚠️ Subscription ${status}</h2>
          <p>Your subscription for ${shop} is ${status.toLowerCase()}. Please renew to continue using the app.</p>
        `);

      default:
        return res.send(`
          <h2>❓ Unknown subscription status</h2>
          <p>Status: ${status}</p>
        `);
    }

  } catch (err) {
    console.error("Billing callback error:", err);
    res.status(500).send("Error verifying subscription.");
  }
});

/* -------------------------------
   APP SUBSCRIPTIONS UPDATE WEBHOOK
------------------------------- */
app.post(
  "/api/webhooks/app_subscriptions_update",
  express.raw({ type: 'application/json' }), // ✅ Add raw body middleware for HMAC verification
  verifyShopifyWebhook, // <-- your middleware to verify HMAC signature
  async (req, res) => {
    try {
      // Shopify webhook body is already a Buffer in rawBody
      const raw = req.rawBody?.toString() || "{}";
      const webhookData = JSON.parse(raw);

      const shop = webhookData.shop_domain || webhookData.shop;
      const subscriptionId = webhookData.id;
      const status = webhookData.status;
      const planName = webhookData.name;
      const expiresAt =
        webhookData.currentPeriodEnd || webhookData.trialEndsAt || null;

      console.log("📩 [Webhook] App Subscription Update:", {
        shop,
        subscriptionId,
        status,
        planName,
        expiresAt,
      });

      if (!subscriptionId || !shop) {
        console.warn("⚠️ Missing subscriptionId or shop in webhook data");
        return res.status(200).send("ok"); // ✅ Always return 200 to Shopify
      }

      // ✅ Validate plan name
      const validPlans = ['free', 'pro', 'growth', 'enterprise'];
      const validatedPlanName = validPlans.includes(planName?.toLowerCase()) 
        ? planName.toLowerCase() 
        : planName || "N/A";

      // Update subscription in your DB
      await Subscription.findOneAndUpdate(
        { subscriptionId },
        {
          shop: shop, // ✅ Add shop field for data consistency
          status: status || "UNKNOWN",
          planName: validatedPlanName,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        },
        { new: true, upsert: false }
      );

      res.status(200).send("ok");
    } catch (err) {
      console.error("❌ Webhook error:", err);
      res.status(200).send("ok"); // ✅ Always return 200 to Shopify
    }
  }
);


/* ---------------------------------------------------
   ✅ NORMAL BODY PARSERS (AFTER WEBHOOKS)
--------------------------------------------------- */
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    // ✅ Don't expose error details
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false); // ✅ Return false instead of error
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(session({
  secret: api_secret,
  resave: false,
  saveUninitialized: false, // ✅ Change to false for security
  cookie: {
    secure: process.env.NODE_ENV === "production", // ✅ Must be true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ Adjust based on environment
    httpOnly: true, // ✅ Add for security
    maxAge: 24 * 60 * 60 * 1000, // ✅ 24 hours
  },
  store: MongoStore.create({ mongoUrl: process.env.DataBaseUrl })
}));

/* ---------------------------------------------------
   ✅ STATIC FILES & DOCS
--------------------------------------------------- */
app.use("/uploads", express.static(join(__dirname, "uploads")));
// Serve public folder
app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request on ${req.path}`);
  next();
});

/* ---------------------------------------------------
   ✅ RATE LIMITING
--------------------------------------------------- */
// Simple in-memory rate limiter
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const record = rateLimitStore.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ 
      error: 'Too many requests from this IP, please try again later.' 
    });
  }
  
  record.count++;
  next();
};

// Apply rate limiting to API routes (excluding webhooks)
app.use('/api', (req, res, next) => {
  // Skip rate limiting for webhooks
  if (req.path.startsWith('/webhooks')) {
    return next();
  }
  rateLimitMiddleware(req, res, next);
});

/* ---------------------------------------------------
   ✅ OAUTH HMAC VALIDATION
--------------------------------------------------- */
function isValidShopifyRequest(query, secret) {
  const { hmac, ...rest } = query;
  const message = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join("&");
  const generatedHash = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("hex");
  return generatedHash === hmac;
}

export async function createScriptTag(shop, accessToken) {
  const url = `https://${shop}/admin/api/2025-10/script_tags.json`;
  const body = {
    script_tag: {
      event: "onload",
      src: "https://app.seojog.app/dev.embed.js"
    }
  };
  try {
    const response = await axios.post(url, body, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (err) {
    console.error("Failed to create ScriptTag:", err.response?.data || err.message);
    // throw err;
  }
}
/* ---------------------------------------------------
   ✅ AUTH ROUTES
--------------------------------------------------- */
app.get("/api/auth", async (req, res) => {
  try {
    const redirectUrl = await shopify.auth.begin({
      shop: req.query.shop,
      callbackPath: "/api/auth/callback",
      isOnline: false,
      rawRequest: req,
      rawResponse: res
    });

    if (!res.headersSent) {
      return res.redirect(redirectUrl);
    }
  } catch (err) {
    console.error("Auth begin error:", err);
    if (!res.headersSent) res.status(500).send("Shopify auth failed");
  }
});

app.get("/api/auth/callback", async (req, res) => {
  try {
    if (!isValidShopifyRequest(req.query, api_secret)) {
      return res.status(403).send("Invalid HMAC");
    }

    const { session: sessionData } = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
      isOnline: false
    });

    const { shop, accessToken } = sessionData;
    if (!shop || !accessToken) return res.status(400).send("Missing shop or token");

const userData = {
      shopifySessionId: sessionData.id,
      shop,
      state: sessionData.state,
      isOnline: sessionData.isOnline,
      scope: sessionData.scope,
      accessToken,
      status: '1'
    };
    await Shop.findOneAndUpdate({ shop }, userData, { upsert: true });

    await createScriptTag(shop, accessToken);

    const webhooks = [
      { topic: "CUSTOMERS_REDACT", path: "/api/webhooks/customers/redact" },
      { topic: "SHOP_REDACT", path: "/api/webhooks/shop/redact" },
      { topic: "CUSTOMERS_DATA_REQUEST", path: "/api/webhooks/customers/data_request" },
      { topic: "APP_UNINSTALLED", path: "/api/webhooks/app/uninstalled" },
      { topic: "APP_SUBSCRIPTIONS_UPDATE", path: "/api/webhooks/app_subscriptions_update" } // ✅ Add billing webhook
    ];

    for (const { topic, path } of webhooks) {
      try {
        await shopify.webhooks.register({
          session: sessionData,
          path,
          topic,
          webhookHandler: async (topic, shop, body) => {
            console.log(`[${topic}] from ${shop}:`, body);
          },
          deliveryMethod: DeliveryMethod.Http
        });
        console.log(`✅ Webhook registered: ${topic}`);
      } catch (err) {
        console.error(`❌ Failed to register webhook ${topic}:`, err);
      }
    }

    const shopName = shop.replace('.myshopify.com', '');
    return res.redirect(`https://admin.shopify.com/store/${shopName}/apps/${api_key}`);
  } catch (err) {
    console.error("Auth callback error:", err);
    if (!res.headersSent) res.status(500).send("Callback error");
  }
});

/* ---------------------------------------------------
   ✅ API ROUTES
--------------------------------------------------- */
const protectedRouter = express.Router();
protectedRouter.use(requireShopifySession);

protectedRouter.use(userRoutes);
protectedRouter.use(blogRoutes);
protectedRouter.use(shopRoutes);
protectedRouter.use("/billing", billingRoutes);
protectedRouter.use(liquidRoutes);

protectedRouter.get("/session", (req, res) => {
  console.log("==============================",req.shopify)
  return res.json({ success: true, shop: req.shopify?.shop });
});

app.use("/api", protectedRouter);





/* ---------------------------------------------------
   ✅ FRONTEND BUILD
--------------------------------------------------- */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(STATIC_PATH));
  app.get("*", (req, res) =>
    res.sendFile(join(STATIC_PATH, "index.html"))
  );
}

// 🧭 Call the error handler at the very end
handleErrors(app, path.resolve("views"));


// ✅ Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("⏳ Running subscription expiry checker...");

    const now = new Date();

    const expiredSubs = await Subscription.updateMany(
      {
        expiresAt: { $lte: now },
        status: { $ne: "EXPIRED" }
      },
      {
        $set: { status: "EXPIRED" }
      }
    );

    console.log(`✅ Expired subscriptions updated: ${expiredSubs.modifiedCount}`);
  } catch (err) {
    console.error("❌ Error in expiry cron:", err);
  }
});

/* ---------------------------------------------------
   ✅ START SERVER
--------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
