import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";
import dotenv from "dotenv";
dotenv.config();

const isTestEnv = process.env.NODE_ENV === "test";
const DB_PATH = process.env.DataBaseUrl;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || (isTestEnv ? "test_key" : undefined);
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || (isTestEnv ? "test_secret" : undefined);
const SHOPIFY_HOST_NAME = process.env.SHOPIFY_HOST_NAME || (isTestEnv ? "test-app.myshopify.com" : undefined);

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !SHOPIFY_HOST_NAME) {
  throw new Error("Missing Shopify configuration. Please set SHOPIFY_API_KEY, SHOPIFY_API_SECRET, and SHOPIFY_HOST_NAME.");
}

if (!DB_PATH && !isTestEnv) {
  throw new Error("Missing DataBaseUrl environment variable.");
}

const sessionStorage = isTestEnv
  ? {
      storeSession: async () => true,
      loadSession: async () => null,
      deleteSession: async () => true,
      deleteSessions: async () => true,
      findSessionsByShop: async () => [],
    }
  : new MongoDBSessionStorage(DB_PATH);

const shopify = shopifyApi({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  scopes: ['read_content','write_content','read_themes','write_themes','read_products','write_products','write_script_tags','read_script_tags'],
  hostName: SHOPIFY_HOST_NAME,
  apiVersion: '2025-10',
  isEmbeddedApp: true,
  sessionStorage,
  // billing: undefined, // optional: we'll define plans dynamically
});

export default shopify;
