// ⚠️ DEPRECATED: This file is not used. Privacy webhooks are handled in web/index.js
// This file can be safely deleted.
// routes/privacyWebhooks.js
import express from "express";
const router = express.Router();

router.post("/webhooks/shop/redact", (req, res) => {
  console.log("SHOP_REDACT webhook received", req.body);
  res.sendStatus(200);
});

router.post("/webhooks/customers/redact", (req, res) => {
  console.log("CUSTOMERS_REDACT webhook received", req.body);
  res.sendStatus(200);
});

router.post("/webhooks/customers/data_request", (req, res) => {
  console.log("CUSTOMERS_DATA_REQUEST webhook received", req.body);
  res.sendStatus(200);
});

export default router;
