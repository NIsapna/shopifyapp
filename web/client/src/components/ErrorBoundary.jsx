import React, { useState, useCallback } from 'react';
import { Page, Card, Text, Button, BlockStack, InlineStack, Banner } from '@shopify/polaris';

// Custom functional ErrorBoundary using react 18's unstable_useErrorBoundary
function ErrorBoundary({ children }) {
  // Note: react@18+ exposes useErrorBoundary via unstable_useErrorBoundary
  // but there's not yet a stable API, so we can use a custom hook to wrap the imperative error boundary logic

  const [errorState, setErrorState] = useState({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  // Helper: get error boundary component with fallback
  // eslint-disable-next-line react/display-name
  const ErrorCatcher = React.useMemo(() => {
    // Class inside function, so can call setErrorState
    return class extends React.Component {
      componentDidCatch(error, errorInfo) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        setErrorState({
          hasError: true,
          error,
          errorInfo,
        });
      }
      render() {
        return this.props.children;
      }
    };
  }, []);

  const handleReset = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }, []);

  if (errorState.hasError) {
    // Render error fallback like class version
    return (
      <Page>
        <Card>
          <BlockStack gap="400">
            <Banner tone="critical" title="Something went wrong">
              <Text as="p">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </Text>
            </Banner>

            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Error Details
              </Text>

              {import.meta.env.DEV && errorState.error && (
                <Card sectioned>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      <strong>Error:</strong> {errorState.error.toString()}
                    </Text>

                    {errorState.errorInfo && (
                      <details style={{ marginTop: '1rem' }}>
                        <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                          <Text as="span" variant="bodyMd">Stack Trace</Text>
                        </summary>
                        <pre style={{
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          padding: '1rem',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px'
                        }}>
                          {errorState.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
            <InlineStack gap="200">
              <Button onClick={handleReset} variant="primary">
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  // Wrap children in error catcher
  return (
    <ErrorCatcher>
      {children}
    </ErrorCatcher>
  );
}

export default ErrorBoundary;
