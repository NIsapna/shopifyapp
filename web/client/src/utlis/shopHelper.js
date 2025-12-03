// src/utils/shopHelper.js

let shopNameFull = "";
let shopNameShort = "";
export const setShopName = (name ) => {
  // name might be full URL or domain (like "https://sumit-bula-store.myshopify.com")
  
  if (!name) return;

  // Remove https:// or http:// if present
  const sanitized = name.replace(/^https?:\/\//, "").trim();

  shopNameFull = sanitized;

  // Extract "sumit-bula-store" from "sumit-bula-store.myshopify.com"
  const short = sanitized.split(".myshopify.com")[0];
  shopNameShort = short || sanitized;
};

export const getShopNameFull = () => shopNameFull;
export const getShopNameShort = () => shopNameShort;
