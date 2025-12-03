import jwt from "jsonwebtoken";

/**
 * Ensures every API request carries a valid Shopify session token.
 * Public routes (OAuth, billing callback, webhooks, static assets) should bypass this middleware explicitly.
 * 
 * DEV MODE: In development, allows bypassing session token if shop is provided in query/body
 */
export default async function requireShopifySession(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    // Check NODE_ENV (handle both with/without spaces in .env file)
    const nodeEnv = (process.env.NODE_ENV || '').trim();
    const isDevMode = nodeEnv === 'development';
    
    // Debug logging (only in dev mode)
    if (isDevMode) {
      console.log(`🔧 DEV MODE: NODE_ENV=${nodeEnv}, isDevMode=${isDevMode}`);
    }
    
    // ✅ DEV MODE: Allow bypass if shop is provided in query/body
    if (isDevMode && (!authHeader || !authHeader.startsWith("Bearer "))) {
      const shop = req.query?.shop || req.body?.shop;
      
      console.log(`🔧 DEV MODE: Checking shop parameter. Shop: ${shop}, URL: ${req.url}, Method: ${req.method}`);
      
      if (shop) {
        // Validate shop format
        const shopDomain = shop.replace(/^https?:\/\//i, "").trim();
        if (shopDomain && shopDomain.includes('.myshopify.com')) {
          console.warn(`⚠️ DEV MODE: Bypassing session token for shop: ${shopDomain}`);
          req.shopify = {
            shop: shopDomain,
            devMode: true,
          };
          return next();
        } else {
          console.warn(`⚠️ DEV MODE: Invalid shop format: ${shopDomain}`);
        }
      }
      
      // If no valid shop in dev mode, still require token
      if (isDevMode) {
        console.warn(`⚠️ DEV MODE: No shop parameter found. Query: ${JSON.stringify(req.query)}, Body: ${JSON.stringify(req.body)}`);
      }
    }

    // ✅ Production mode or dev mode with no shop: require session token
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing session token" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return res.status(401).json({ error: "Missing session token" });
    }

    // ✅ Enhanced validation
    const payload = jwt.verify(token, process.env.SHOPIFY_API_SECRET, {
      algorithms: ["HS256"],
      maxAge: '1h', // ✅ Add expiration check
    });
    
    if (!payload?.dest) {
      return res.status(401).json({ error: "Invalid session token" });
    }
    
    // ✅ Validate shop domain format
    const shopDomain = payload.dest.replace(/^https?:\/\//i, "");
    if (!shopDomain || !shopDomain.includes('.myshopify.com')) {
      return res.status(401).json({ error: "Invalid shop domain in token" });
    }
    
    req.shopify = {
      sessionToken: payload,
      shop: shopDomain,
      tokenIssuedAt: payload.iat,
      devMode: false,
    };
    next();
  } catch (error) {
    // ✅ Better error handling
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Session token expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid session token" });
    }
    console.error("Session validation failed", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}