import express from 'express';
import { CreateAuthor, GetAuthor, GetAllAuthor,UpdateAuthor ,DeleteAuthor,sendSupportEmail} from '../Controller/UserController.js';
import { upload } from '../config/fileUpload.js';

const router = express.Router();
// Create / Update
router.post('/CreateAuthor', upload.single('image'), CreateAuthor);
// Get profile
router.get('/GetAuthor', GetAuthor);

router.get('/GetAllAuthor', GetAllAuthor);
router.put('/UpdateAuthor/:id', upload.single('image'), UpdateAuthor);
router.delete('/DeleteAuthor/:id', DeleteAuthor);



/**
 * @openapi
 * /api/CreateAuthor:
 *   post:
 *     summary: Create a new Author profile
 *     description: Creates a new Author profile if the email does not already exist.
 *     tags:
 *       - Authors
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               bio:
 *                 type: string
 *                 example: "Software developer with 5 years experience"
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               image:
 *                 type: string
 *                 format: binary
 *               linkedin:
 *                 type: string
 *                 example: https://linkedin.com/in/johndoe
 *               twitter:
 *                 type: string
 *                 example: https://twitter.com/johndoe
 *               instagram:
 *                 type: string
 *                 example: https://instagram.com/johndoe
 *               shop:
 *                 type: string
 *                 example: dumitstore.com
 *     responses:
 *       201:
 *         description: Author Profile created successfully
 *       400:
 *         description: Author Profile already exists with this email
 *       500:
 *         description: Server error
 *
 * /api/GetAuthor:
 *   get:
 *     summary: Get a Author profile by ID
 *     description: Fetches a Author profile along with its shop details by userId.
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f5d1b4a1a4c123456789ab
 *         description: The ID of the user to fetch
 *     responses:
 *       200:
 *         description: Author fetched successfully
 *       400:
 *         description: userId query parameter is required
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 *
 * /api/GetAllAuthor:
 *   get:
 *     summary: Get all author profiles
 *     description: Fetches all author along with their shop details.
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: query
 *         name: shop
 *         required: true
 *         schema:
 *           type: string
 *           example: sumit-bula-store.myshopify.com
 *         description: The shop of the user shop to fetch users
 *     responses:
 *       200:
 *         description: Author Profiles fetched successfully
 *       404:
 *         description: No Author profiles found
 *       500:
 *         description: Server error
 *
 */

/**
 * @openapi
 * /api/UpdateAuthor/{id}:
 *   put:
 *     summary: Update Author details
 *     description: This API updates an existing author's details including image using form-data.
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               twitter:
 *                 type: string
 *               instagram:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Author updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */



/**
 * @openapi
 * /api/DeleteAuthor/{id}:
 *   delete:
 *     summary: Delete an author by ID
 *     description: Permanently deletes an author from the database using the provided ID and shop identifier.
 *     tags:
 *       - Authors
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique ID of the author to delete.
 *         schema:
 *           type: string
 *       - name: shop
 *         in: query
 *         required: true
 *         description: Shop identifier to ensure scoped deletion.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Author deleted successfully.
 *       400:
 *         description: Missing required fields or invalid data.
 *       404:
 *         description: Author not found.
 *       500:
 *         description: Internal server error.
 */




// API for sending support email
/**
 * @openapi
 * /api/sendSupportEmail:
 *   post:
 *     summary: Send a support email to the support team
 *     description: This API sends a support request email with user details.
 *     operationId: sendSupportMail
 *     tags:
 *       - Support
 *     requestBody:
 *       description: User's support request details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 description: The phone number of the user
 *                 example: "1234567890"
 *               appUrl:
 *                 type: string
 *                 description: The app's URL for reference
 *                 example: https://yourapp.com
 *               message:
 *                 type: string
 *                 description: The message or query from the user
 *                 example: I need help with my account.
 *     responses:
 *       200:
 *         description: Support request sent successfully
 *       500:
 *         description: Error sending email
 */
router.post("/sendSupportEmail", sendSupportEmail);


export default router;

