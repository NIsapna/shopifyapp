// src/store/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // localStorage
import { persistReducer, persistStore } from "redux-persist";

import { blogsApi } from "./blogsApi";
import { authorApi } from "./authorApi";
import { pricingApi } from "./pricingApi";
import { snippetApi } from "./snippetApi";
import blogReducer from "./blogSlice";
import dummyBlogReducer from "./dummyBlogSlice";

// Persist config for dummy blog slice (localStorage)
const dummyBlogPersistConfig = {
  key: "dummyBlog",
  storage: storage, // persists in localStorage
};

// Wrap dummyBlogReducer with persistReducer
const persistedDummyBlogReducer = persistReducer(dummyBlogPersistConfig, dummyBlogReducer);

// Combine all reducers
const rootReducer = combineReducers({
  [blogsApi.reducerPath]: blogsApi.reducer,
  [authorApi.reducerPath]: authorApi.reducer,
  [pricingApi.reducerPath]: pricingApi.reducer,
  [snippetApi.reducerPath]: snippetApi.reducer,
  blog: blogReducer,
  dummyBlog: persistedDummyBlogReducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist uses non-serializable values
    }).concat(
      blogsApi.middleware,
      authorApi.middleware,
      pricingApi.middleware,
      snippetApi.middleware
    ),
});

// Persistor for localStorage persistence
export const persistor = persistStore(store);
