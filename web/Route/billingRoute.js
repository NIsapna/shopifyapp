import express from "express";
import { createSubscription , getActivePlan} from "../Controller/billingController.js";

const router = express.Router();

router.post("/subscribe", createSubscription);
/**
 * @openapi
 * /api/billing/subscribe:
 *   post:
 *     summary: Create or activate a subscription for a shop
 *     description: 
 *       Activates a free plan directly or initiate000000000000000000000000000000000000000000000000000000000000s a paid plan subscription via Shopify GraphQL API.
 *     tags:
 *       - Subscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shop:
 *                 type: string
 *                 description: Shop domain (e.g., example.myshopify.com)
 *               plan:
 *                 type: string
 *                 description: Subscription plan to activate ("free", "pro", "growth", "enterprise")
 *             required:
 *               - shop
 *               - plan
 *             example:
 *               shop: "sumit-bula-store.myshopify.com"
 *               plan: "pro"
 *     responses:
 *       200:
 *         description: Subscription created successfully
 *       400:
 *         description: Invalid request or Shopify GraphQL error
 *       404:
 *         description: Shop not found in database
 *       500:
 *         description: Internal server error
 */

router.get("/getActivePlan", getActivePlan);
/**
 * @openapi
 * /api/billing/getActivePlan:
 *   get:
 *     summary: Get the active subscription plan for a shop
 *     tags:
 *       - Subscription
 *     parameters:
 *       - in: query
 *         name: shop
 *         schema:
 *           type: string
 *         required: true
 *         description: The myshopify domain of the shop (e.g., test-shop.myshopify.com)
 *     responses:
 *       200:
 *         description: Returns the active plan details
 *       400:
 *         description: Bad request (missing shop parameter)
 *       404:
 *         description: Shop not found
 *       500:
 *         description: Internal server error
 */

export default router;
