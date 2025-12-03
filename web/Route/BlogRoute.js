import express from 'express';
import { getBlogs, getBlogsById, updateArticle } from '../Controller/BlogController.js';
import { upload } from '../config/fileUpload.js';


const router = express.Router();


/**
 * @openapi
 * /api/getBlogs:
 *   get:
 *     summary: Get blog posts
 *     description: Fetches blog posts from the database.
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: query
 *         name: shop
 *         schema:
 *           type: string
 *         required: true
 *         description: The shop identifier to fetch website configuration.
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully.
 *       500:
 *         description: Internal Server Error.
 */

router.get("/getBlogs", getBlogs);



/**
 * @openapi
 * /api/getBlogsById:
 *   get:
 *     summary: Get blog details by ID
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: query
 *         name: shop
 *         schema:
 *           type: string
 *         required: true
 *         description: The shop identifier to fetch shop data.
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The id identifier to fetch blog(gid://shopify/Article/601646760179)
 *     responses:
 *       200:
 *         description: Blog found successfully
 *       400:
 *         description: Missing or invalid blog ID
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Internal server error
 */
router.get("/getBlogsById", getBlogsById);


/**
 * @openapi
 * /api/updateArticle:
 *   put:
 *     summary: Update an existing Shopify blog article
 *     description: >
 *       Updates the details of an existing article in Shopify Admin, including title, content (body),
 *       tags, and optionally the author (staff member). Requires a valid Shopify Admin access token.
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: query
 *         name: shop
 *         required: true
 *         description: Shopify store domain (e.g. sumit-bula-store.myshopify.com)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 example: "gid://shopify/Article/601646760179"
 *               blog_id:
 *                 type: string
 *                 example: "gid://shopify/Blog/98156118259"
 *               title:
 *                 type: string
 *                 example: "Updated Blog Title ✨"
 *               body_html:
 *                 type: string
 *                 description: HTML content of the article.
 *                 example: "<h1>Updated Content</h1><p>This is new content.</p>"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Updated", "News"]
 *               metaTitle:
 *                 type: string
 *                 example: "Updated Blog Title ✨"
 *               metaDescription:
 *                 type: string
 *                 example: "Updated Blog Title ✨"   
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       400:
 *         description: Invalid request or user errors from Shopify
 *       500:
 *         description: Server error
 */
router.put("/updateArticle", upload.none(), updateArticle);

export default router;

