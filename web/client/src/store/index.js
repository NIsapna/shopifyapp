// src/store/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";

import { blogsApi } from "./blogsApi";
import { authorApi } from "./authorApi";
import { pricingApi } from "./pricingApi";
import { snippetApi } from "./snippetApi";
import blogReducer from "./blogSlice";

// Combine all reducers
const rootReducer = combineReducers({
  [blogsApi.reducerPath]: blogsApi.reducer,
  [authorApi.reducerPath]: authorApi.reducer,
  [pricingApi.reducerPath]: pricingApi.reducer,
  [snippetApi.reducerPath]: snippetApi.reducer,
  blog: blogReducer,
});

// Configure store (no persistence)
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      blogsApi.middleware,
      authorApi.middleware,
      pricingApi.middleware,
      snippetApi.middleware
    ),
});
