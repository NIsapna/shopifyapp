let appBridgeInstance = null;

export const setAppBridge = (app) => {
  appBridgeInstance = app;
};

export const getAppBridge = () => appBridgeInstance;
