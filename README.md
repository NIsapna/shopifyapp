# SEOJog - Author Management for Shopify Blogs

## Overview

SEOJog is a Shopify app focused on Author Management for Blogs. The app helps you manage author profiles and assign them to your blog posts, while providing view-only blog optimization analysis reports.

### Core Features:

• **Create Author Profiles** - Create and manage author profiles with basic details

• **Assign Authors to Blogs** - Assign created authors to your blog posts

• **Blog Optimization Analysis (View Only)** - View blog optimization analysis reports within the blog section

**Important Notes:**

• The app does NOT generate blog content

• The app does NOT automatically optimize blogs

• The app only manages authors and displays optimization analysis reports

## Installation & Testing Guide

**Note:** This is required because the app uses Shopify OAuth session tokens. Tokens are generated only after installing the app inside a development store.

### INSTALLATION:

1. Install the app using the OAuth URL format below (replace YOUR-STORE-NAME with your development store name):

   ```
   https://app.seojog.app/api/auth?shop=YOUR-STORE-NAME.myshopify.com
   ```

2. Approve the requested permissions during the installation process.

3. After installation, open the app from: **Shopify Admin → Apps → SEOJog**

4. The app will load as an embedded app using Shopify App Bridge and will automatically redirect to the dashboard.

### APP CONFIGURATION:

• No additional configuration is required after installation.

• The app is ready to use immediately.

### TESTING THE DASHBOARD:

• Navigate to: **Shopify Admin → Apps → SEOJog**

• The dashboard loads automatically with the main interface.

• Available pages: Dashboard, Blog Post, Manage Authors, Pricing, Support

### TESTING BILLING/SUBSCRIPTIONS:

1. Navigate to the "Pricing" page in the app to test subscription plans.

2. Available plans:

   • **Free Plan** - Activates immediately; no billing required
     - Add 1 Author Profile
     - Assign Unlimited Authors to Blogs
     - Blog Optimization Analysis
     - Support via Email & Chat

   • **Pro Plan** - $10/month
     - Add up to 3 Author Profiles
     - Assign Unlimited Authors to Blogs
     - Blog Optimization Analysis
     - Support via Email & Chat

   • **Growth Plan** - $20/month
     - Add up to 10 Author Profiles
     - Assign Unlimited Authors to Blogs
     - Blog Optimization Analysis
     - Support via Email & Chat


3. To test paid plans:

   • Select any paid plan (Pro or Growth)

   • Approve the subscription on Shopify's billing confirmation screen

   • The plan will activate after approval

### APP-SPECIFIC SETTINGS:

• No special settings required for testing.

• Ensure your development store has at least one blog post to test the author assignment and blog optimization analysis features.

### USING THE APP:

**Creating Author Profiles:**

1. Navigate to **Manage Authors** from the main menu
2. Click "Add Author" or "Create Author"
3. Fill in author details (name, bio, image, social links)
4. Save the author profile

**Assigning Authors to Blogs:**

1. Navigate to **Blog Post** or **Assign Authors to Blogs** from the main menu
2. Select a blog post
3. Choose an author from your created author profiles
4. Assign the author to the blog post

**Viewing Blog Optimization Analysis:**

1. Navigate to **Blog Post** section
2. Select a blog post to view its optimization analysis
3. Review the analysis report (view-only, no automatic changes are made)

