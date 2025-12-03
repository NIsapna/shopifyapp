# Development Mode Guide

## ✅ Dev Mode Added!

Your app now supports **Development Mode** which allows you to run the frontend locally without Shopify Admin for UI testing.

## How It Works

When you run the frontend on `http://localhost:5174` without the `host` query parameter, the app automatically detects development mode and:

1. ✅ **Skips App Bridge initialization** (no host parameter required)
2. ✅ **Renders the UI** so you can test components and layouts
3. ✅ **Shows a warning banner** explaining dev mode limitations
4. ✅ **Uses simple navigation** instead of App Bridge NavMenu
5. ✅ **Sets a mock shop name** for testing

## Running in Dev Mode

### Option 1: Run Frontend Only (Dev Mode)

```bash
# Terminal 1 - Backend
cd web
npm run dev

# Terminal 2 - Frontend (Dev Mode)
cd web/client
npm run dev
```

Then open: `http://localhost:5174`

**What works:**
- ✅ UI components render
- ✅ Navigation works
- ✅ Routes work
- ✅ Polaris components work
- ✅ Redux store works

**What doesn't work:**
- ❌ Session authentication (no App Bridge)
- ❌ Shopify API calls (no session tokens)
- ❌ App Bridge features (modals, toasts, etc.)
- ❌ Real shop data

### Option 2: Full Functionality (Shopify CLI)

```bash
cd web
shopify app dev
```

Then access through Shopify Admin - **full functionality** with App Bridge.

## Dev Mode Features

### Warning Banner

When you first load the app in dev mode, you'll see a warning banner explaining:
- You're in development mode
- Some features won't work
- How to get full functionality

You can dismiss the banner by clicking "Dismiss Warning".

### Simple Navigation

In dev mode, the app uses simple React Router links instead of App Bridge NavMenu, so navigation still works.

### Mock Shop Name

The app sets a mock shop name (`dev-store.myshopify.com` or from `?shop=` URL param) so components that depend on shop context can render.

## Limitations

**Important:** Dev mode is for **UI testing only**. For full functionality:

1. Use `shopify app dev` - Creates tunnel and provides full App Bridge
2. Access through Shopify Admin - Full authentication and API access

## When to Use Dev Mode

✅ **Use Dev Mode for:**
- Testing UI components and layouts
- Developing new pages/routes
- Testing Polaris component styling
- Quick frontend iteration without Shopify setup

❌ **Don't use Dev Mode for:**
- Testing API integrations
- Testing authentication flows
- Testing Shopify-specific features
- Final testing before deployment

## Code Changes Made

### App.jsx Changes

1. **Dev Mode Detection:**
   ```javascript
   const isDevMode = import.meta.env.DEV && !host;
   ```

2. **Skip App Bridge in Dev Mode:**
   - No App Bridge initialization
   - No session token fetching
   - Mock shop name set

3. **Dev Mode Warning Banner:**
   - Dismissible warning card
   - Explains limitations
   - Shows how to get full functionality

4. **Conditional Navigation:**
   - Simple links in dev mode
   - App Bridge NavMenu in production

### API Calls

The `baseQuery.js` already handles missing App Bridge gracefully:
- If App Bridge is null, API calls proceed without Authorization header
- This allows UI to render even if API calls fail

## Testing

1. **Start backend:** `cd web && npm run dev`
2. **Start frontend:** `cd web/client && npm run dev`
3. **Open browser:** `http://localhost:5174`
4. **See dev mode warning** and dismiss it
5. **Navigate and test UI** components

## Troubleshooting

### "Still seeing error message"
- Make sure you're accessing `http://localhost:5174` directly (not through Shopify Admin)
- Check browser console for any errors
- Ensure `import.meta.env.DEV` is `true` (should be in Vite dev mode)

### "Navigation not working"
- Dev mode uses React Router links, make sure routes are set up correctly
- Check browser console for routing errors

### "API calls failing"
- This is expected in dev mode - no session tokens
- Use `shopify app dev` for full API functionality

## Summary

✅ **Dev Mode Added** - Run frontend locally for UI testing  
✅ **Warning Banner** - Clear indication of dev mode limitations  
✅ **Simple Navigation** - Works without App Bridge  
✅ **Mock Shop Context** - Components can render properly  

For full functionality, always use `shopify app dev` or access through Shopify Admin!

