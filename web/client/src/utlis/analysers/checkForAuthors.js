 

// src/utlis/seoAnalysis.js
import { capitalizeName } from "../helper";


/**
 * Analyzes author SEO check
 * @param {Object} blogAuthor - The author from the blog/article (e.g., { name: "John" })
 * @param {Object|Array} assignedAuthors - Assigned authors from API (legacy support)
 * @param {Array} allAuthorsFromManagement - All authors from authors management system
 * @returns {Object} Analysis result with status and message
 */
export const analyzeAuthorForSeo = (blogAuthor, assignedAuthors = null, allAuthorsFromManagement = []) => {
  // Helper for checking bio
  const hasBio = (author) =>
    !!(author && typeof author.bio === "string" && author.bio.trim().length > 0);

  // Helper to find author in management system by name (case-insensitive)
  const findAuthorInManagement = (authorName) => {
    if (!authorName || !Array.isArray(allAuthorsFromManagement) || allAuthorsFromManagement.length === 0) {
      return null;
    }
    return allAuthorsFromManagement.find(
      (author) => author?.name?.trim().toLowerCase() === authorName.trim().toLowerCase()
    );
  };

  // 🚫 Case 1: Blog has no author
  if (!blogAuthor || !blogAuthor.name || blogAuthor.name.trim() === "") {
    return {
      status: "missing",
      message: "No author found. Assign an author to build credibility.",
      showAssignButton: true,
    };
  }

  const blogAuthorName = blogAuthor.name.trim();
  const capitalizedName = capitalizeName(blogAuthorName);

  // 🧩 Case 2: Check if blog author exists in our authors management system
  const authorInManagement = findAuthorInManagement(blogAuthorName);

  if (!authorInManagement) {
    // Blog has author but not in our management system
    return {
      status: "warning",
      message: `Author "${capitalizedName}" is not in your authors management. Add this author to manage their bio and improve SEO.`,
      showAssignButton: true,
    };
  }

  // 🧩 Case 3: Author exists in management - check if has bio
  const bioExists = hasBio(authorInManagement);

  if (!bioExists) {
    return {
      status: "warning",
      message: `Author "${capitalizedName}" has no bio. Add a bio to the author's profile to improve SEO.`,
      showAssignButton: true,
    };
  }

  // ✅ Case 4: Author exists and has bio
  return {
    status: "good",
    message: `Author "${capitalizedName}" has a bio — great for SEO.`,
    showAssignButton: true,
  };
};


export const analyzeorSeo = (blogAuthor, assignedAuthors) => {
  // console.log("analyzeAuthorForSeo called with:", blogAuthor, assignedAuthors);

  const hasAssignedAuthor = Array.isArray(assignedAuthors)
    ? assignedAuthors.length > 0
    : assignedAuthors && Object.keys(assignedAuthors || {}).length > 0;

  // 🚫 If assignedAuthors came as null or API error
  if (!assignedAuthors || (typeof assignedAuthors === "object" && Object.keys(assignedAuthors).length === 0)) {
    // treat it as missing author
    if (!blogAuthor || Object.keys(blogAuthor).length === 0) {
      return {
        status: "missing",
        message: "No author found. Assign an author to build credibility.",
        showAssignButton: true,
      };
    }

    if (!blogAuthor?.bio || blogAuthor?.bio.trim() === "") {
      return {
        status: "warning",
        message: "Blog author has no bio. Assign an author with bio to improve SEO.",
        showAssignButton: true,
      };
    }

    return {
      status: "good",
      message: `Author "${capitalizeName(blogAuthor?.name)}" has a bio — great for SEO.`,
      showAssignButton: true,
    };
  }

  // ✅ If we reach here, valid assigned author(s) exist
  const authorName =
    assignedAuthors?.name ||
    (Array.isArray(assignedAuthors) ? assignedAuthors[0]?.name : undefined);

  // If blog has no author
  if (!blogAuthor || Object.keys(blogAuthor).length === 0) {
    return {
      status: "good",
      message: `Author "${capitalizeName(authorName)}" is assigned.`,
      showAssignButton: true,
    };
  }

  // Blog author exists but no bio
  if (!blogAuthor?.bio || blogAuthor?.bio.trim() === "") {
    return {
      status: "good",
      message: `Author "${capitalizeName(authorName)}" is assigned.`,
      showAssignButton: true,
    };
  }

  // Blog author exists and has bio
  return {
    status: "good",
    message: `Author "${capitalizeName(blogAuthor?.name)}" has a bio — great for SEO.`,
    showAssignButton: true,
  };
};


