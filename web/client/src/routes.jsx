
import { Page, Text } from "@shopify/polaris";
import { Routes as ReactRouterRoutes, Route } from "react-router-dom";

export default function AppRoutes({ pages }) {
  if (!pages || typeof pages !== "object" || Object.keys(pages).length === 0) {
    return <div>No pages found</div>;
  }
  const routes = useRoutes(pages);
  const routeComponents = routes.map(({ path, component: Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ));

  // const NotFound = routes.find(({ path }) => path === "/notFound").component;

  const found = routes.find(({ path }) => path === "/notFound");
  const NotFound = found?.component || DefaultNotFound;

  return (
    <ReactRouterRoutes>
      {routeComponents}
      <Route path="*" element={<NotFound />} />
    </ReactRouterRoutes>
  );
}

function useRoutes(pages) {
  const routes = Object.keys(pages)
    .map((key) => {
      let path = key
        .replace("./pages", "")
        .replace(/\.(t|j)sx?$/, "")
        .replace(/\/index$/i, "/")
        .replace(/\b[A-Z]/, (firstLetter) => firstLetter.toLowerCase())
        .replace(/\[(?:[.]{3})?(\w+?)\]/g, (_match, param) => `:${param}`);

      if (path.endsWith("/") && path !== "/") {
        path = path.substring(0, path.length - 1);
      }
      if (!pages[key].default) {
        console.warn(`${key} doesn't export a default React component`);
      }
      return {
        path,
        component: pages[key].default,
      };
    })
    .filter((route) => route.component);

  return routes;
}

function DefaultNotFound() {
  return (
    <Page title="Page Not Found">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "64px" }}>
        <svg
          width="96"
          height="96"
          fill="none"
          viewBox="0 0 96 96"
          aria-hidden="true"
          style={{ marginBottom: 24 }}
        >
          <circle cx="48" cy="48" r="46" stroke="#FFC453" strokeWidth="4" fill="#FFF8E1" />
          <text x="50%" y="54%" textAnchor="middle" fill="#FFC453" fontSize="36" fontWeight="bold" dy=".3em">404</text>
        </svg>
        <Text as="h1" variant="heading2xl" alignment="center" tone="critical" style={{ marginBottom: 16 }}>
          Page Not Found
        </Text>
        <Text as="p" alignment="center" tone="subdued" style={{ marginBottom: 32 }}>
          Sorry, the page you&#8217;re looking for doesn&#8217;t exist or has been moved.
        </Text>
        <a href="/" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{
              background: "#008060",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "12px 28px",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#005e46")}
            onMouseOut={e => (e.currentTarget.style.background = "#008060")}
          >
            Go to Home
          </button>
        </a>
      </div>
    </Page>
  );
}
