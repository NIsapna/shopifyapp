# Shopify CLI Local Development Setup

## ✅ Yes! Shopify CLI Creates Secure Tunnels Automatically

When you run `shopify app dev`, the CLI **automatically**:
1. Creates a secure tunnel (using Cloudflare Tunnel or ngrok)
2. Updates your app URLs in Shopify Partners Dashboard
3. Starts your backend and frontend servers
4. Enables hot-reload for local development
5. Allows your app to load inside Shopify Admin iframe

## Project Structure

Your app uses the **correct structure** for Shopify CLI:

```
Shop_Blog_Pro/
├── web/                          # Main app directory
│   ├── shopify.app.toml         # ✅ Main app configuration (THIS IS THE ONE TO USE)
│   ├── shopify.web.toml          # Backend server config
│   ├── .env                      # Environment variables
│   ├── package.json              # Backend dependencies
│   ├── index.js                  # Backend entry point
│   └── client/
│       ├── shopify.app.toml      # Frontend config
│       ├── package.json          # Frontend dependencies
│       └── src/                  # React frontend
```

**Important:** The `shopify.app.toml` in the `web/` directory is your main configuration file.

## Configuration Updates Made

✅ **Updated `web/shopify.app.toml`:**
- Enabled `automatically_update_urls_on_dev = true` (was false)
- Added localhost redirect URL for local development
- Updated scopes to match your app requirements

## How to Run Locally

### Step 1: Install Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
```

### Step 2: Navigate to Web Directory

```bash
cd /home/aadil/New\ Folder/shopify_app_progress/Shop_Blog_Pro/web
```

### Step 3: Run Shopify CLI

```bash
shopify app dev
```

**What happens:**
1. CLI will prompt you to authenticate (first time only)
2. CLI will ask you to select your app
3. CLI creates a secure tunnel automatically
4. CLI updates your app URLs in Shopify Partners
5. Backend starts on port 4500
6. Frontend starts on port 5174
7. You'll see a tunnel URL like: `https://xxxx-xxxx.tunnel.shopify.app`

### Step 4: Access Your App

1. **Open your development store** in Shopify Admin
2. **Navigate to Apps → SEOJog**
3. **Your local app loads** with all your local changes visible!

## How the Tunnel Works

Shopify CLI uses **Cloudflare Tunnel** (or ngrok as fallback) to:
- Create a secure HTTPS URL that points to your localhost
- Automatically update your app's URLs in Shopify Partners
- Allow Shopify Admin to load your app in an iframe (requires HTTPS)
- Enable hot-reload so changes appear immediately

**You don't need to:**
- ❌ Manually set up ngrok
- ❌ Manually update URLs in Shopify Partners
- ❌ Configure SSL certificates
- ❌ Worry about CORS issues

**The CLI handles everything automatically!**

## Environment Variables

Make sure your `.env` file in `/web` directory has:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_HOST_NAME=your-app.myshopify.com
DataBaseUrl=mongodb://localhost:27017/shop_blog_pro
HOST=http://localhost:4500
PORT=4500
NODE_ENV=development
```

## Update dev_store_url (Optional)

In `web/shopify.app.toml`, you can optionally set:

```toml
[build]
automatically_update_urls_on_dev = true
dev_store_url = "your-dev-store.myshopify.com"  # Optional: pre-selects store
```

If you don't set `dev_store_url`, CLI will prompt you to select a store each time.

## Troubleshooting

### "Shopify CLI not found"
```bash
npm install -g @shopify/cli @shopify/theme
```

### "Cannot connect to tunnel"
- Check your internet connection
- Try running `shopify app dev` again
- The CLI will automatically retry with different tunnel providers

### "App not loading in Shopify Admin"
1. Make sure you're using `shopify app dev` (not manual npm run dev)
2. Check that `automatically_update_urls_on_dev = true` in `shopify.app.toml`
3. Verify the tunnel URL is active (check CLI output)
4. Clear browser cache and hard refresh

### "Port already in use"
```bash
# Kill processes on ports 4500 and 5174
lsof -ti:4500 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

## Key Points

✅ **Shopify CLI automatically creates secure tunnels** - no manual setup needed  
✅ **Use `shopify app dev` from the `web/` directory**  
✅ **The `web/shopify.app.toml` is your main config file**  
✅ **Local changes appear immediately in Shopify Admin**  
✅ **Hot-reload works for both frontend and backend**

## Quick Command Reference

```bash
# From web/ directory
cd web

# Start development with tunnel
shopify app dev

# Check app info
shopify app info

# Deploy app
shopify app deploy
```

That's it! The CLI handles all the tunneling complexity for you. 🚀

