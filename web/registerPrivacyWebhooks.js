// registerPrivacyWebhooks.js
import shopify from "./shopify.js";
import { DeliveryMethod } from "@shopify/shopify-api";  // 👈 this is the correct import

export const registerPrivacyWebhooks = async () => {
  const topics = [
    { topic: "SHOP_REDACT", path: "/api/webhooks/shop/redact" },
    { topic: "CUSTOMERS_REDACT", path: "/api/webhooks/customers/redact" },
    { topic: "CUSTOMERS_DATA_REQUEST", path: "/api/webhooks/customers/data_request" },
  ];

  for (const { topic, path } of topics) {
    try {
      await shopify.webhooks.addHandlers({
        [topic]: {
          deliveryMethod: DeliveryMethod.Http,  // 👈 fixed here
          callbackUrl: path,
        },
      });
      console.log(`✅ Successfully registered ${topic}`);
    } catch (err) {
      console.error(`❌ Failed to register ${topic}:`, err);
    }
  }
};
