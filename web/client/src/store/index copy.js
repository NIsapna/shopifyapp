// src/store/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storageSession from "redux-persist/lib/storage/session"; // sessionStorage
import { persistReducer, persistStore } from "redux-persist";

import { blogsApi } from "./blogsApi";
import { authorApi } from "./authorApi";
import { pricingApi } from "./pricingApi";
import { snippetApi } from "./snippetApi";
import blogReducer from "./blogSlice";

// 1️⃣ Persist config for blog slice (persist only selected blog info)
const blogPersistConfig = {
  key: "blog",
  storage: storageSession,       // persists in sessionStorage
  // whitelist: ["selectedBlogId", "selectedBlogData","showSeoPanel"], // only these keys persist
};

// 2️⃣ Wrap blogReducer with persistReducer
const persistedBlogReducer = persistReducer(blogPersistConfig, blogReducer);
// const persistedBlogReducer = blogReducer;
// 3️⃣ Combine all reducers
const rootReducer = combineReducers({
  [blogsApi.reducerPath]: blogsApi.reducer,
  [authorApi.reducerPath]: authorApi.reducer,
  [pricingApi.reducerPath]: pricingApi.reducer,
  [snippetApi.reducerPath]: snippetApi.reducer,
  blog: persistedBlogReducer,
});

// 4️⃣ Configure store
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

// 5️⃣ Persistor for PersistGate
export const persistor = persistStore(store);
