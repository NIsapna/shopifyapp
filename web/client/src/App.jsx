
import React, { useEffect, useState } from 'react';
import { AppProvider, Spinner, Card, Text, BlockStack, Page } from '@shopify/polaris';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { NavMenu } from "@shopify/app-bridge-react";
import { Provider } from 'react-redux';
import axios from 'axios';
import createApp from '@shopify/app-bridge';
import { PolarisProvider } from "./components/providers/PolarisProvider";

import ShopContext from './utlis/ShopContext';
import AppRoutes from './routes';
import { store } from './store';
import "./App.css";
import { PlanProvider } from './context/PlanContext';
import { setAppBridge } from "./bridge/appBridge";
import ErrorBoundary from './components/ErrorBoundary';
import { setShopName } from './utlis/shopHelper';

const API_URL = import.meta.env.VITE_HOST;

const queryParams = new URLSearchParams(window.location.search);
const host = queryParams.get("host");
const shop = queryParams.get("shop"); // shop param, not for prod fallback

// Check if we're in development mode (missing host in dev environment)
// Vite provides import.meta.env.DEV (boolean) or import.meta.env.MODE automatically
// Also check for VITE_NODE_ENV if explicitly set
const isDevMode = (import.meta.env.DEV || 
                   import.meta.env.MODE === 'development' || 
                   import.meta.env.VITE_NODE_ENV === 'development') && !host;

// Create config - use mock config in dev mode if host is missing
const config = host ? {
  apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
  host,
  forceRedirect: true,
} : (isDevMode ? {
  apiKey: import.meta.env.VITE_SHOPIFY_API_KEY ,
  host: "dev-mode",
  forceRedirect: false,
} : null);

export default function App() {
  const [shopName, setShopNameState] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);
  const [devModeWarning, setDevModeWarning] = useState(isDevMode);
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", { eager: true, }) || {};

  useEffect(() => {
    // If no host and not in dev mode, show error
    if (!host && !isDevMode) {
      setInitError("Missing required parameters. Please access this app through Shopify Admin.");
      setIsInitializing(false);
      return;
    }

    // In dev mode without host, skip App Bridge initialization
    if (isDevMode) {
      // eslint-disable-next-line no-console
      console.warn("⚠️ DEV MODE: Running without Shopify App Bridge. Some features may not work.");
      // eslint-disable-next-line no-console
      console.warn("⚠️ For full functionality, use 'shopify app dev' or access through Shopify Admin.");
      // eslint-disable-next-line no-console
      console.log("🔧 DEV MODE Debug:", {
        DEV: import.meta.env.DEV,
        MODE: import.meta.env.MODE,
        VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
        host: host,
        isDevMode: isDevMode
      });
      
      // Set a mock shop name for dev mode
      const mockShop = shop ||  import.meta.env.VITE_SHOP_NAME || "sumit-bula-store.myshopify.com";
      setShopNameState(mockShop);
      setShopName(mockShop);
      setIsInitializing(false);
      return;
    }

    // Normal initialization with App Bridge
    const app = createApp(config);
    setAppBridge(app);

    getSessionToken(app)
      .then(async (token) => {
        try {
          const response = await axios.get(`${API_URL}/api/session`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const fullShopUrl = response?.data?.shop || shop
          if (fullShopUrl) {
            const sanitized = fullShopUrl.replace(/^https?:\/\//, '');
            setShopNameState(sanitized);
            setShopName(fullShopUrl); // Initialize shop name for link analysis
          }
          setInitError(null);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("API error:", error);
          setInitError("Failed to initialize session. Please refresh the page.");
        } finally {
          setIsInitializing(false);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Token fetch error:", err);
        setInitError("Failed to fetch session token. Please refresh the page.");
        setIsInitializing(false);
      });
  }, [host, config, isDevMode, shop]);

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <PolarisProvider>
        <AppProvider config={config || { apiKey: import.meta.env.VITE_SHOPIFY_API_KEY }}>
          <Page>
            <Card sectioned>
              <BlockStack gap="400" align="center">
                <Spinner accessibilityLabel="Initializing app" size="large" />
                <Text as="p" tone="subdued">Loading your app...</Text>
              </BlockStack>
            </Card>
          </Page>
        </AppProvider>
      </PolarisProvider>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <PolarisProvider>
        <AppProvider config={config || { apiKey: import.meta.env.VITE_SHOPIFY_API_KEY }}>
          <Page>
            <Card sectioned>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd" tone="critical">
                  Configuration Error
                </Text>
                <Text as="p">{initError}</Text>
                <Text as="p" tone="subdued">
                  Please access this app through Shopify Admin or contact support if the issue persists.
                </Text>
              </BlockStack>
            </Card>
          </Page>
        </AppProvider>
      </PolarisProvider>
    );
  }

  return (
    <ErrorBoundary>
      <PolarisProvider>
        <Provider store={store}>
          <Router>
            <ShopContext.Provider value={shopName || ""}>
              <PlanProvider>
                <AppProvider config={config || { apiKey: import.meta.env.VITE_SHOPIFY_API_KEY }}>
                  {devModeWarning && (
                    <Card sectioned>
                      <BlockStack gap="300">
                        <Text as="h3" variant="headingMd" tone="warning">
                          ⚠️ Development Mode
                        </Text>
                        <Text as="p" tone="subdued">
                          You're running in development mode without Shopify App Bridge. 
                          Some features like session authentication and Shopify API calls may not work.
                        </Text>
                        <Text as="p" tone="subdued">
                          <strong>For full functionality:</strong> Use <code>shopify app dev</code> from the web directory, 
                          or access the app through Shopify Admin.
                        </Text>
                        <button
                          onClick={() => setDevModeWarning(false)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#008060',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: 'fit-content'
                          }}
                        >
                          Dismiss Warning
                        </button>
                      </BlockStack>
                    </Card>
                  )}
                  {isDevMode ? (
                    // Simple navigation for dev mode (NavMenu requires App Bridge)
                    <div style={{ padding: '16px', backgroundColor: '#f6f6f7', borderBottom: '1px solid #e1e3e5' }}>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Link to="/" style={{ textDecoration: 'none', color: '#008060' }}>Home</Link>
                        <Link to="/manage-authors" style={{ textDecoration: 'none', color: '#008060' }}>Manage Authors</Link>
                        <Link to="/assign-authors" style={{ textDecoration: 'none', color: '#008060' }}>Assign Authors</Link>
                        <Link to="/blog-optimization" style={{ textDecoration: 'none', color: '#008060' }}>Blog Optimization</Link>
                        <Link to="/pricing" style={{ textDecoration: 'none', color: '#008060' }}>Pricing</Link>
                        <Link to="/support" style={{ textDecoration: 'none', color: '#008060' }}>Support</Link>
                      </div>
                    </div>
                  ) : (
                    <NavMenu>
                      <a href="/" rel="home" />
                      <a href="/manage-authors">Manage Authors</a>
                      <a href="/assign-authors">Assign Authors to Blogs</a>
                      <a href="/blog-optimization">Blog Optimization</a>
                      {/* <a href="/article-details">Article Details</a> */}
                      <a href="/pricing">Pricing</a>
                      {/* <a href="/blog-post">Blog Post</a> */}
                      <a href="/support">Support</a>
                    </NavMenu>
                  )}
                  <AppRoutes pages={pages} />
                </AppProvider>
              </PlanProvider>
            </ShopContext.Provider>
          </Router>
        </Provider>
      </PolarisProvider>
    </ErrorBoundary>
  );
}
