// analyzers/links.js
export const analyzeLinks = (doc, storeUrl) => {
    const links = Array.from(doc.querySelectorAll("a"));
    const internal = links.filter(a => a.hostname.includes(storeUrl)).length;
    const passed = internal > 0 && links.length > 0;
    return { passed, result: { internal, external: links.length - internal } };
  };
  