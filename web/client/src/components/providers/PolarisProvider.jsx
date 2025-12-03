import { useCallback } from "react";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import translations from '@shopify/polaris/locales/en.json';

function AppBridgeLink({ url, children, external, ...rest }) {
  const handleClick = useCallback(() => window.open(url), [url]);

  const IS_EXTERNAL_LINK_REGEX = /^(?:[a-z][a-z\d+.-]*:|\/\/)/;

  if (external || IS_EXTERNAL_LINK_REGEX.test(url)) {
    return (
      <a {...rest} href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}

export function PolarisProvider({ children }) {

  const theme = {
    colors: {
      surface: "#f4f6f8", // Background color for UI
      onSurface: "#212B36", // Text color on surface
      interactive: "#008060", // Shopify’s green color
      secondary: "#005E3A", // Darker shade of Shopify green
      critical: "#D82C0D", // Error messages
      warning: "#FFC453", // Warning messages
      success: "#008060", // Success messages
      highlight: "#E0F2F1", // Highlighted elements
      decorative: "#B3E5FC", // For subtle decorations
      white: '#ffffff',
      black: '#000000',
    },
    typography: {
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      fontWeightRegular: "400",
      fontWeightBold: "600",
    },
    spacing: {
      tight: "4px",
      base: "8px",
      loose: "16px",
    },
    borderRadius: "8px",
  };


  return (
    <AppProvider i18n={translations} linkComponent={AppBridgeLink} theme={theme}>
      {children}
    </AppProvider>
  );
}
