


// async function getActiveTheme(shop, accessToken) {
//   const res = await fetch(`https://${shop}/admin/api/2025-10/themes.json`, {
//     headers: { "X-Shopify-Access-Token": accessToken }
//   });
//   const data = await res.json();
//   console.log("Themes:", data.themes); // ✅ Ye dekh lo kaunse themes available hai
//   const mainTheme = data.themes.find(theme => theme.role === "main");
//   return mainTheme ? mainTheme.id : null;
// }



// async function uploadSnippet(shop, accessToken, themeId, snippetContent) {
//   console.log("Uploading snippet to theme...",shop);
//   const key = "snippets/author-block.liquid"; // <--- ensure snippets/ prefix
//   const res = await fetch(`https://${shop}/admin/api/2025-10/themes/${themeId}/assets.json`, {
//     method: "PUT",
//     headers: {
//       "X-Shopify-Access-Token": accessToken,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       asset: { key, value: snippetContent }
//     })
//   });
// console.log(res)
//   const data = await res.json();
//   if (data.errors) {
//     console.error("Upload failed:", data.errors);
//     // throw new Error("Snippet upload failed");
//   }
//   console.log("Snippet uploaded successfully!");
// }


// async function addIncludeToLayout(shop, accessToken, themeId) {
//   // 1. Fetch existing layout file
//   const key = "layout/theme.liquid";
//   const fetchRes = await fetch(`https://${shop}/admin/api/2025-10/themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(key)}`, {
//     headers: { "X-Shopify-Access-Token": accessToken }
//   });
//   const asset = await fetchRes.json();
//   let content = asset.asset?.value || "";

//   const includeTag = "{% render 'blogpro-author-card' %}";

//   if (!content.includes(includeTag)) {
//     // Simple insertion before </body>
//     if (content.includes("</body>")) {
//       content = content.replace("</body>", `${includeTag}\n</body>`);
//     } else {
//       // fallback: append at the end
//       content = content + "\n" + includeTag;
//     }

//     // Save updated layout back
//     await fetch(`https://${shop}/admin/api/2025-10/themes/${themeId}/assets.json`, {
//       method: "PUT",
//       headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
//       body: JSON.stringify({ asset: { key, value: content } })
//     });
//   }
// }


// async function registerUninstallWebhook(shop, accessToken, webhookUrl) {
//   const res = await fetch(`https://${shop}/admin/api/2025-10/webhooks.json`, {
//     method: "POST",
//     headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
//     body: JSON.stringify({
//       webhook: {
//         topic: "app/uninstalled",
//         address: webhookUrl,
//         format: "json"
//       }
//     })
//   });
//   return res.ok;
// }

// // export default connectDB; // Use ES module export
// export { getActiveTheme, uploadSnippet, addIncludeToLayout, registerUninstallWebhook };

