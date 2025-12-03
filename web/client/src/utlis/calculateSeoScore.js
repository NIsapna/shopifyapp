 
 
export const calculateSeoScore = (analyses) => {
  if (!analyses || !analyses.length) return { score: 0, breakdown: [] };

  const weights = { good: 1, warning: 0.5, missing: 0 };
  const total = analyses.length;
  const sum = analyses.reduce((acc, a) => acc + (weights[a.status] ?? 0), 0);

  const score = Math.round((sum / total) * 100);
  return { score, breakdown: analyses };
};

 
 const calcSeoScore = (seoChecks, selectedBlogData) => {
  if (!seoChecks || !selectedBlogData) return { score: 0, breakdown: [] };

  let totalPoints = 0;
  let achievedPoints = 0;
  const breakdown = []; // 👈 store details for logs/UI

  seoChecks.forEach((item) => {
    // Base weight by type
    let baseWeight = 10;
    switch (item.id) {
      case "meta_title":
      case "meta_description":
        baseWeight = 20;
        break;
      case "heading_tags":
        // case "image_alt_tags":
        // case "toc_check":
        baseWeight = 20;
        break;
      case "internal_links":
      case "external_links":
        baseWeight = 20;
        break;
      // case "author_bio":
      //   baseWeight = 10;
      //   break; 
      // case "readability":
      //   baseWeight = 20;
      //   break;
      default:
        baseWeight = 10;
    }

    // Priority multiplier
    let priorityMultiplier = 1;
    switch (item.priority) {
      case "high":
        priorityMultiplier = 1.5;
        break;
      case "low":
        priorityMultiplier = 0.5;
        break;
      default:
        priorityMultiplier = 1;
    }

    const weight = baseWeight * priorityMultiplier;
    totalPoints += weight;

    // Analyze check
    const value = item.getValue ? item.getValue(selectedBlogData) : "";
    // const analysis = item.checkValue ? item.checkValue(value) : { status: "missing" };
    // console.log(analysis);
    let analysis = { status: "missing" };
    if (item.checkValue) {
      // special case for author_bio: provide full context
      if (item.id === "author_bio") {
        analysis = item.checkValue(value, blog, blog?.assignedAuthors || {});
      } else {
        analysis = item.checkValue(value, blog);
      }
    }

    let points = 0;
    switch (analysis.status) {
      case "good":
        points = weight;
        break;
      case "warning":
        points = Math.round(weight * 0.5);
        break;
      default:
        points = 0;
    }

    achievedPoints += points;

    // 🪵 Log each check’s details
    // console.log(
    //   `%c[SEO Check] ${item.label || item.id}`,
    //   "color: #00bcd4; font-weight: bold;"
    // );
    // console.log({
    //   status: analysis.status,
    //   baseWeight,
    //   priority: item.priority || "medium",
    //   finalWeight: weight,
    //   earnedPoints: points,
    // });

    // Optional: save for UI display
    breakdown.push({
      id: item.id,
      label: item.label || item.id,
      status: analysis.status,
      baseWeight,
      priority: item.priority || "medium",
      finalWeight: weight,
      earnedPoints: points,
    });
  });

  const score = totalPoints > 0 ? Math.round((achievedPoints / totalPoints) * 100) : 0;

  // console.log(
  //   "%c[SEO SCORE SUMMARY]",
  //   "color: #4caf50; font-weight: bold;"
  // );
  console.table(breakdown);
  console.log("Total Points:", totalPoints, "Achieved:", achievedPoints, "Score:", score);

  // Return both score & breakdown
  return { score, breakdown };
};
