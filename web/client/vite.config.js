import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname } from "path";
import  dotenv  from 'dotenv';
import { fileURLToPath } from "url";

dotenv.config();

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  throw new Error(
    "\n\nThe frontend build will not work without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command, for example:" +
      "\n\nSHOPIFY_API_KEY=<your-api-key> npm run build\n"
  );
}


process.env.VITE_SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;

const proxyOptions = {
  target: `https://app.seojog.app`,
  changeOrigin: false,
  secure: true,
  ws: false,
};


const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 4500,
    clientPort: 5174,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443,
  };
}

// https://vite.dev/config/
export default defineConfig({
    root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
   server: {
    port: 5174,     
    strictPort: true,
    host: "localhost",
      proxy: {
      "/api": {
        target: process.env.VITE_HOST || "http://localhost:4500",
        changeOrigin: true,
        secure: false,
      }
    }  
  },
    optimizeDeps: {
    include: [
      '@shopify/app-bridge', 
      '@shopify/app-bridge-react',
      '@shopify/app-bridge/actions'
    ],
  },
    resolve: {
    preserveSymlinks: true,
  },
})
