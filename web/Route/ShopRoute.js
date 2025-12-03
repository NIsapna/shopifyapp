import express from 'express';
import { GetShopDetails } from '../Controller/ShopController.js';

const router = express.Router();



/**
 * @openapi
 * /api/GetShopDetails:
 *   get:
 *     summary: Get a shop details by ID
 *     description: Fetches a shop details.
 *     tags:
 *       - Shop Details
 *     parameters:
 *       - in: query
 *         name: shop
 *         required: true
 *         schema:
 *           type: string
 *           example: sumit-bula-store.myshopify.com
 *     responses:
 *       200:
 *         description: Author fetched successfully
 *       400:
 *         description: userId query parameter is required
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */

router.get('/GetShopDetails', GetShopDetails);

export default router;