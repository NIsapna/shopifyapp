import { analyzeHeadings } from "./analyzers/headings";

export const stepsConfig = [
  {
    key: "headings",
    label: "Headings Structure",
    run: analyzeHeadings,
  },
  // ... other steps (links, images, meta, etc.)
];
