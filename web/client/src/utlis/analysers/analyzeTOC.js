// src/utlis/seoAnalysis.js
export const analyzeTOC = (html) => {
    if (!html) return { status: "missing", message: "No content", hasTOC: false };
  
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
  
    // Look for a TOC by common selectors
    const tocElement =
      doc.querySelector(".toc") || // div with class toc
      doc.querySelector("#toc") || // div with id toc
      doc.querySelector("ul.toc") ||
      doc.querySelector("ol.toc") ||
      Array.from(doc.querySelectorAll("ul, ol")).find((list) => {
        // check if list contains links to headings
        return Array.from(list.querySelectorAll("a[href]")).some((a) =>
          /^#/.test(a.getAttribute("href"))
        );
      });
  
    if (tocElement) {
      return {
        status: "good",
        message: "Table of Contents found.",
        hasTOC: true,
      };
    } else {
      return {
        status: "warning",
        message: "No Table of Contents found. Consider adding one for better navigation.",
        hasTOC: false,
      };
    }
  };
  