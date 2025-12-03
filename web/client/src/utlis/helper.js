
// Helper for per-step ExceptionList
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  NoteIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";

export function generateExceptionItems(stepKey, results, status) {
  const success = status === "success";
  switch (stepKey) {
    case "headings":
      return [
        {
          icon: success ? CheckCircleIcon : AlertCircleIcon,
          description: success
            ? `Perfect! You have a single H1 and structured subheadings.`
            : `There should be exactly one H1 tag. Found ${results.headings?.h1}.`,
        },
      ];
    case "links":
      return [
        {
          icon: success ? CheckCircleIcon : AlertCircleIcon,
          description: success
            ? `Good link structure with internal and external links.`
            : `Missing or unbalanced internal/external link structure.`,
        },
      ];
    case "images":
      return [
        {
          icon: success ? CheckCircleIcon : AlertCircleIcon,
          description: success
            ? `Alt tags are present for most images.`
            : `Low alt tag coverage (${results.images?.coverage}%).`,
        },
      ];
    case "meta":
      return [
        {
          icon: success ? CheckCircleIcon : AlertCircleIcon,
          description: success
            ? `Meta title and description are properly defined.`
            : `Missing or incomplete meta title/description.`,
        },
      ];
    default:
      return [];
  }
}

export const getMetafieldValue = (blog, key) => {
  return (
    blog?.metafields?.edges?.find((edge) => edge.node.key === key)?.node?.value || ""
  );
};


export const capitalizeName = (name) => {
  if (!name || typeof name !== "string") return name || "";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
