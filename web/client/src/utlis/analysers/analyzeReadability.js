// src/utlis/seoAnalysis.js
export const analyzeReadability = (html) => {
    if (!html) return { status: "missing", message: "No content", score: 0 };
  
    // Strip HTML tags to get plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
  
    // Split into sentences (simple split by punctuation)
    const sentences = text.split(/[\.\!\?]+/).map((s) => s.trim()).filter(Boolean);
  
    if (sentences.length === 0) return { status: "missing", message: "No readable content", score: 0 };
  
    // Average sentence length
    const avgSentenceLength = sentences.reduce((acc, s) => acc + s.split(" ").length, 0) / sentences.length;
  
    // Simple scoring
    let status = "good";
    let message = "Content is readable.";
  
    if (avgSentenceLength > 20) {
      status = "warning";
      message = `Average sentence length is ${Math.round(avgSentenceLength)} words. Try using shorter, simpler sentences.`;
    }
  
    return {
      status,
      message,
      avgSentenceLength: Math.round(avgSentenceLength),
      sentenceCount: sentences.length,
    };
  };
  