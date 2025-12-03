// analyzers/headings.js

export const analyzeHeadings = (doc) => {
    const h1 = doc.querySelectorAll("h1").length;
    const h2 = doc.querySelectorAll("h2").length;
    const h3 = doc.querySelectorAll("h3").length;
  
    let passed = true;
    let message = "Good heading structure";
  
    if (h1 === 0) {
      passed = false;
      message = "No H1 tag found. Add exactly one H1 tag.";
    } else if (h1 > 1) {
      passed = false;
      message = `Multiple H1 tags (${h1}) found. Keep only one H1 for SEO.`;
    }
  
    return {
      passed,
      result: { h1, h2, h3 },
      message,
    };
  };
  