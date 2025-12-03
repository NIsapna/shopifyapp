import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  ProgressBar,
  Divider,
  ExceptionList,
  Icon,
  InlineGrid,
  Modal,
  TextField,
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  NoteIcon,
  AlertCircleIcon,
} from "@shopify/polaris-icons";
import { motion } from "framer-motion";
import { generateExceptionItems, capitalizeName } from "../utlis/helper";

const stepsConfig = [
  { key: "headings", label: "Headings Structure" },
  { key: "links", label: "Link Analysis" },
  // { key: "images", label: "Image Alt Tags" },
  { key: "meta", label: "Meta Information" },
  { key: "wordCount", label: "Word Count" },
  { key: "keywords", label: "Meta Keywords" },
  { key: "tags", label: "Tags Check" },       // ✅ new
  { key: "author", label: "Author Check" },
  { key: "imageOptimization", label: "Image Optimization" }

];


const SeoAnalysis = ({ html, showAnalysis, blogTitle, blogId, onFix, onRestart, imageSrc, tags, metaDescNode, author }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isDone, setIsDone] = useState(false);
  const [fixedHtml, setFixedHtml] = useState(html);
  const [showFixModal, setShowFixModal] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [isFixed, setIsFixed] = useState(false);


  const parser = new DOMParser();
  const doc = html ? parser.parseFromString(html, "text/html") : null;

  useEffect(() => {
    if (showAnalysis) runAnalysis();
  }, [showAnalysis]);

  const runAnalysis = async () => {
    setCurrentStep(0);
    setStatuses({});
    setResults({});
    setIsDone(false);

    for (let i = 0; i < stepsConfig.length; i++) {
      const step = stepsConfig[i];
      setCurrentStep(i);

      await new Promise((r) => setTimeout(r, 1000));

      if (!doc) continue;
      let passed = true;
      let result = {};

      switch (step.key) {
        case "headings": {
          const h1 = doc.querySelectorAll("h1").length;
          const h2 = doc.querySelectorAll("h2").length;
          const h3 = doc.querySelectorAll("h3").length;
          passed = h1 === 1;
          result = { h1, h2, h3 };
          break;
        }
        case "links": {
          const links = Array.from(doc.querySelectorAll("a"));
          const internal = links.filter((a) =>
            a.hostname.includes("sumit-bula-store.myshopify.com")
          ).length;
          passed = internal > 0 && links.length > 0;
          result = { internal, external: links.length - internal };
          break;
        }
        case "images": {
          const imgs = Array.from(doc.querySelectorAll("img"));
          const withAlt = imgs.filter((i) => i.alt && i.alt.trim()).length;
          const coverage = imgs.length ? (withAlt / imgs.length) * 100 : 100;
          passed = coverage >= 80;
          result = { coverage: Math.round(coverage) };
          break;
        }
        case "meta": {
          const title = blogTitle || doc.querySelector("title")?.textContent || "";
          passed = title.length > 0;
          result = { title };
          break;
        }
        case "imageOptimization": {
          const imgs = Array.from(doc.querySelectorAll("img"));
          const total = imgs.length;

          const withAlt = imgs.filter(img => img.alt && img.alt.trim()).length;
          const webpImages = imgs.filter(img => /\.webp$/i.test(img.src)).length;

          const altCoverage = total ? (withAlt / total) * 100 : 100;
          const webpCoverage = total ? (webpImages / total) * 100 : 100;

          // Pass only if all images have alt and are webp
          passed = altCoverage === 100 && webpCoverage === 100;

          result = {
            totalImages: total,
            altImages: withAlt,
            webpImages: webpImages,
            altCoverage: Math.round(altCoverage),
            webpCoverage: Math.round(webpCoverage),
          };
          break;
        }

        // case "meta": {
        //   const title = blogTitle || doc.querySelector("title")?.textContent || "";
        //   const desc = metaDescNode || doc.querySelector('meta[name="description"]')?.content || "";
        //   passed = title.length > 0 && desc.length > 0;
        //   result = { title };
        //   break;
        // }
        // case "author": {
        //   const title = blogTitle || doc.querySelector("title")?.textContent || "";
        //   const desc = doc.querySelector('meta[name="description"]')?.content || "";
        //   passed = title.length > 0 && desc.length > 0;
        //   result = { title, desc };
        //   break;
        // }
        case "wordCount": {
          const text = doc.body?.textContent || "";
          const count = text.trim().split(/\s+/).length;
          passed = count >= 800;
          const message =
            count < 800
              ? `Word count is ${count}. Add ${800 - count} more words to reach 800.`
              : `Word count is ${count}.`;

          result = { count, message };
          break;
        }

        case "keywords": {
          const keywords = doc.querySelector('meta[name="keywords"]')?.content || "";
          passed = keywords.length > 0;
          result = { keywords };
          break;
        }
        case "tags": {
          const hasTags = tags && tags.length > 0;
          passed = hasTags;
          result = { hasTags, tagsList: tags || [] };
          break;
        }

        case "author": {
          const hasAuthor = !!(blogId && author && author.name);
          const hasBio = !!(author && author.bio && author.bio.trim().length > 0);
          passed = hasAuthor;
          result = { hasAuthor, hasBio, authorName: capitalizeName(author?.name || "-") };
          break;
        }

        default:
          break;
      }
      setResults((p) => ({ ...p, [step.key]: result }));
      setStatuses((p) => ({ ...p, [step.key]: passed ? "success" : "error" }));
    }

    setIsDone(true);
  };

  // 🛠️ FIX ACTION — opens modal for user-input fixes
  const handleFixIssues = () => {
    const metaErrors =
      !results.meta?.desc || !results.keywords?.keywords; // meta description or keywords missing
    const wordIssue = results.wordCount?.count < 800;

    // Check if blog title exists
    const missingTitle = !blogTitle || blogTitle.trim() === "";
    setShowTitleInput(missingTitle); // show input only if title missing
    if (missingTitle) setShowFixModal(true);
    // if (metaErrors || wordIssue || missingTitle) setShowFixModal(true);
  };


  const applyFixes = () => {
    if (!doc) return;


    const h1Tags = Array.from(doc.querySelectorAll("h1"));
    if (h1Tags.length > 1) {
      h1Tags.slice(1).forEach(tag => {
        const h2 = document.createElement("h2");
        h2.innerHTML = tag.innerHTML;
        tag.replaceWith(h2);
      });
    }

    // Update title only if input is shown
    if (showTitleInput) {
      const finalTitle = metaTitle || " ";
      const titleNode = doc.querySelector("title") || doc.createElement("title");
      titleNode.textContent = finalTitle;
      if (!doc.querySelector("title")) doc.head.appendChild(titleNode);
    }
    const updatedBody = doc.body.innerHTML;
    const updatedTags = Array.isArray(tags) ? [...new Set([...tags, "SEO", "Updated"])] : ["SEO", "Updated"];

    const updatedBlogData = {
      id: blogId,
      title: metaTitle || blogTitle || "",
      body: updatedBody,
      author: { name: "Bharti Nigam" },
      tags: updatedTags,
      image: { originalSrc: imageSrc },
      blog: { id: blogId, title: blogTitle || "News", handle: "news" },
      updatedAt: new Date().toISOString(),
    };

    console.log("✅ Blog title/meta fixed:", updatedBlogData);
    setFixedHtml(updatedBody);
    setShowFixModal(false);

    if (onFix) onFix(updatedBlogData);
    setIsFixed(true);
  };

  // ✅ Send fixed HTML back to backend — follows correct structure
  const sendFixedToBackend = async (fixedBody) => {
    try {
      setIsUpdating(true);

      const updatedBlogData = {
        id: blogId,
        title: metaTitle || blogTitle,
        body: fixedBody,
        author: {
          name: "Bharti Nigam",
        },
        tags: tags && tags.length ? tags : ["SEO", "Updated"],
      };
      setBlog(prev => ({
        ...prev,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      }));

      console.log("Frontend-only update done!");
    } catch (err) {
      console.error("❌ Failed to update blog:", err);
    } finally {
      setIsUpdating(false);
      setIsDone(true);
    }
  };

  const progress =
    ((Object.keys(statuses).length / stepsConfig.length) * 100).toFixed(0);

  if (!showAnalysis)
    return (
      <Card sectioned>
        <BlockStack gap="3" >
          <Text variant="headingMd">SEO Analyzer</Text>
          <Text tone="subdued">
            Click “Start Analyze” to begin the SEO evaluation.
          </Text>
        </BlockStack>
      </Card>
    );

  return (
    <>
      <Card>
        <BlockStack gap="400" padding="400">
          <InlineStack align="space-between">
            <Text variant="headingMd">SEO Analyzer</Text>
            {isDone && !isFixed && (
              <Button onClick={handleFixIssues} size="slim">
                Fix SEO Issues
              </Button>
            )}

            {isDone && isFixed && (
              <Button
                onClick={() => {
                  setIsFixed(false);
                  runAnalysis();
                }}
                size="slim"
                primary
              >
                Start Analyze Again
              </Button>
            )}
          </InlineStack>

          <ProgressBar progress={progress} />

          <BlockStack gap="100">
            {stepsConfig.map((step, i) => {
              const status = statuses[step.key];
              const isActive = currentStep === i && !isDone;

              // Determine ExceptionList icon based on status
              let icon = NoteIcon;
              if (status === "success") icon = CheckCircleIcon;
              else if (status === "error") icon = XCircleIcon;

              // Description text
              let description = "Pending...";
              if (isDone) {
                description = Object.entries(results[step.key] || {})
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" | ");
              }

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    backgroundColor:
                      status === "success"
                        ? "var(--p-color-success-subdued)"
                        : status === "error"
                          ? "var(--p-color-critical-subdued)"
                          : "var(--p-color-bg-surface-secondary)",
                    borderRadius: "var(--p-border-radius-200)",
                    padding: "1rem",
                  }}
                >
                  <ExceptionList
                    items={[
                      {
                        icon,
                        description: (
                          <div>
                            <strong>{step.label}</strong>
                            <br />
                            {isActive && !isDone ? (
                              <span style={{ color: "var(--p-color-text-subdued)" }}>
                                Analyzing...
                              </span>
                            ) : (
                              description
                            )}
                          </div>
                        ),
                      },
                    ]}
                  />
                </motion.div>
              );
            })}
          </BlockStack>


          {/* Divider and Global Summary */}
          {isDone && (
            <>
              <Divider />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <BlockStack gap="3">

                  <Text variant="headingSm">Overall Summary</Text>
                  <BlockStack gap="200" wrap>
                    <Badge tone="success">
                      H1: {results.headings?.h1} | H2: {results.headings?.h2} | H3:{" "}
                      {results.headings?.h3}
                    </Badge>
                    <Badge tone="info">
                      Internal: {results.links?.internal} | External:{" "}
                      {results.links?.external}
                    </Badge>
                    {/* <Badge tone="attention">
                      Alt Tag Coverage: {results.images?.coverage}%
                    </Badge> */}
                    <Badge tone="success">
                      Title: {results.meta?.title ? "OK" : "Missing"}
                    </Badge>
                    <Badge tone="success">
                      Meta Description: {results.meta?.desc ? "OK" : "Missing"}
                    </Badge>
                    <Badge tone="info">Word Count: {results.wordCount?.count}</Badge>
                    <Badge tone={results.keywords?.keywords ? "success" : "critical"}>
                      Keywords: {results.keywords?.keywords ? "OK" : "Missing"}
                    </Badge>
                    <Badge tone={results.tags?.hasTags ? "success" : "critical"}>
                      Tags: {results.tags?.hasTags ? results.tags.tagsList.join(", ") : "Missing"}
                    </Badge>

                    <Badge tone={results.author?.hasAuthor ? "success" : "critical"}>
                      Author: {results.author?.authorName || "Missing"}
                    </Badge>

                    <Badge tone={results.author?.hasBio ? "success" : "critical"}>
                      Author Bio: {results.author?.hasBio ? "Present" : "Missing"}
                    </Badge>
                    {/* <Badge tone={results.imageCheck?.altCoverage === 100 ? "success" : "critical"}>
                      Alt Tags: {results.imageCheck?.altCoverage}% of images
                    </Badge> */}
                    <Badge tone={results.imageCheck?.webpCoverage === 100 ? "success" : "critical"}>
                      WebP: {results.imageCheck?.webpCoverage}% of images
                    </Badge>

                  </BlockStack>
                </BlockStack>
              </motion.div>
            </>
          )}
          {isUpdating && <Spinner size="small" />}
          {updateSuccess && (
            <Banner tone="success">
              Blog updated successfully with fixed SEO structure 🎉
            </Banner>
          )}
        </BlockStack>
      </Card>

      <Modal
        open={showFixModal}
        onClose={() => setShowFixModal(false)}
        title="Fix Missing SEO Details"
        primaryAction={{
          content: "Apply Fixes",
          onAction: applyFixes,
        }}
      >
        <Modal.Section>
          <BlockStack gap="200">
            {showTitleInput && (
              <TextField
                label="Meta Title"
                value={metaTitle}
                onChange={setMetaTitle}
                placeholder="Enter blog title..."
              />
            )}

          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
};



export default SeoAnalysis;
