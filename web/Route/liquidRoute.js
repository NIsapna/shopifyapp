// routes/liquid.js
import express from "express";
import { generateLiquidSnippetController   ,getAllAssignAuthor,GetAllAssignAuthorBy, assignAuthorAndUpdateBlogAuthorController} from "../Controller/liquidController.js";

const router = express.Router();

// POST /api/liquid/generate-snippet
router.post("/generate_snippet", generateLiquidSnippetController);
/**
 * @openapi
 * /api/generate_snippet:
 *   post:
 *     summary: Generate Liquid snippet for a single blog author
 *     description: Assigns an author to a specific blog article and generates a Shopify Liquid snippet for rendering the author details.
 *     tags:
 *       - Liquid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shop
 *               - blogId
 *               - articleId
 *               - authorId
 *             properties:
 *               shop:
 *                 type: string
 *                 description: Shopify store domain (e.g. sumit-bula-store.myshopify.com)
 *               blogId:
 *                 type: string
 *                 description: Blog ID in Shopify GraphQL format
 *                 example: "gid://shopify/Blog/98156118259"
 *               articleId:
 *                 type: string
 *                 description: Article ID in Shopify GraphQL format
 *                 example: "gid://shopify/Article/601646760179"
 *               authorId:
 *                 type: string
 *                 description: MongoDB ObjectId of the author
 *                 example: "670f1b2a75b9812c2d24e61f"
 *     responses:
 *       200:
 *         description: Successfully generated Liquid snippet
 *       400:
 *         description: Missing or invalid fields
 *       500:
 *         description: Server error while generating snippet
 */


// router.post("/assignAuthorToPost/:postId", assignAuthorToPost);

// /**
//  * @openapi
//  * /api/assignAuthorToPost/{postId}:
//  *   post:
//  *     summary: Assign an author to a Shopify blog post and append signature
//  *     tags:
//  *       - Liquid
//  *     parameters:
//  *       - in: path
//  *         name: postId
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Shopify blog post ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - shop
//  *               - author
//  *             properties:
//  *               shop:
//  *                 type: string
//  *                 description: Shopify shop domain
//  *                 example: my-shop.myshopify.com
//  *               author:
//  *                 type: string
//  *                 description: MongoDB author ID
//  *                 example: 64f2c8a5d4a1c9b123456789
//  *               layout:
//  *                 type: string
//  *                 description: Optional signature layout
//  *                 example: default
//  *     responses:
//  *       200:
//  *         description: Author assigned and blog post updated successfully
//  *       500:
//  *         description: Server error
//  */

// router.post("/assignAuthor", assignAuthor);
// /**
//  * @openapi
//  * /api/assignAuthor:
//  *   post:
//  *     summary: Assign or update an author to a Shopify blog article
//  *     tags:
//  *       - Authors
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - shop
//  *               - blogId
//  *               - articleId
//  *               - name
//  *               - authorId
//  *             properties:
//  *               shop:
//  *                 type: string
//  *                 description: Shopify store domain
//  *                 example: "sumit-bula-store.myshopify.com"
//  *               blogId:
//  *                 type: string
//  *                 description: Shopify blog ID
//  *                 example: "gid://shopify/Blog/98156118259"
//  *               articleId:
//  *                 type: string
//  *                 description: Shopify article ID
//  *                 example: "gid://shopify/Article/601646760179"
//  *               authorId:
//  *                 type: string
//  *                 description: author  _ID
//  *                 example: "546565757798156118259"
//  *               name:
//  *                 type: string
//  *                 description: Author name
//  *                 example: "Sapna Negi"
//  *               bio:
//  *                 type: string
//  *                 description: Short bio of the author
//  *                 example: "Digital marketing expert with 5+ years experience"
//  *               image:
//  *                 type: string
//  *                 description: Author image URL or path
//  *                 example: "uploads/1760007688743.webp"
//  *               linkedin:
//  *                 type: string
//  *                 description: Author LinkedIn URL
//  *                 example: "http://localhost:5174/author"
//  *               twitter:
//  *                 type: string
//  *                 description: Author Twitter URL
//  *                 example: "http://localhost:5174/author"
//  *               instagram:
//  *                 type: string
//  *                 description: Author Instagram URL
//  *                 example: "http://localhost:5174/author"
//  *     responses:
//  *       200:
//  *         description: Author assigned successfully
//  *       400:
//  *         description: Missing required fields
//  *       500:
//  *         description: Server error
//  */

router.get("/getAllAssignAuthor", getAllAssignAuthor);
/**
 * @openapi
 * /api/getAllAssignAuthor:
 *   get:
 *     summary: Get author(s) for a Shopify blog or article
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: query
 *         name: shop
 *         required: true
 *         schema:
 *           type: string
 *           example: "sumit-bula-store.myshopify.com"
 *         description: Shopify store domain
 *       - in: query
 *         name: blogId
 *         required: false
 *         schema:
 *           type: string
 *           example: "gid://shopify/Blog/98156118259"
 *         description: Shopify blog ID
 *       - in: query
 *         name: articleId
 *         required: false
 *         schema:
 *           type: string
 *           example: "gid://shopify/Article/601646760179"
 *         description: Shopify article ID
 *     responses:
 *       200:
 *         description: Author(s) retrieved successfully
 *       400:
 *         description: Missing shop
 *       404:
 *         description: No authors found
 *       500:
 *         description: Server error
 */


/**
 * @openapi
 * /api/GetAllAssignAuthorBy:
 *   get:
 *     summary: Get a Author profile by ID
 *     description: Fetches a Author profile along with its shop details by userId.
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f5d1b4a1a4c123456789ab
 *         description: The _ID of the user to fetch
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
router.get("/GetAllAssignAuthorBy", GetAllAssignAuthorBy);

/**
 * @openapi
 * /api/assignAuthorAndUpdateBlogAuthor:
 *   post:
 *     summary: Assign author to blog and update blog's default author name
 *     description: Assigns an author to a specific blog article, updates the article body with author block, and updates the blog's default author name in Shopify.
 *     tags:
 *       - Liquid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shop
 *               - blogId
 *               - articleId
 *               - authorId
 *             properties:
 *               shop:
 *                 type: string
 *                 description: Shopify store domain (e.g. sumit-bula-store.myshopify.com)
 *               blogId:
 *                 type: string
 *                 description: Blog ID in Shopify GraphQL format
 *                 example: "gid://shopify/Blog/98156118259"
 *               articleId:
 *                 type: string
 *                 description: Article ID in Shopify GraphQL format
 *                 example: "gid://shopify/Article/601646760179"
 *               authorId:
 *                 type: string
 *                 description: MongoDB ObjectId of the author
 *                 example: "670f1b2a75b9812c2d24e61f"
 *     responses:
 *       200:
 *         description: Successfully assigned author and updated blog author name
 *       400:
 *         description: Missing or invalid fields
 *       500:
 *         description: Server error
 */
router.post("/assignAuthorAndUpdateBlogAuthor", assignAuthorAndUpdateBlogAuthorController);

export default router;
