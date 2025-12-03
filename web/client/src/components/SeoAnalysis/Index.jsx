import React, { useEffect } from "react";
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
} from "@shopify/polaris";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  NoteIcon,
} from "@shopify/polaris-icons";
import { motion } from "framer-motion";
import { stepsConfig } from "./stepsConfig";
import { useSeoAnalyzer } from "./useSeoAnalyzer";
import { generateExceptionItems } from "../../utlis/helper";

const SeoAnalysis = ({ html, showAnalysis, onRestart }) => {
  const parser = new DOMParser();
  const doc = html ? parser.parseFromString(html, "text/html") : null;

  const { currentStep, results, statuses, isDone, runAnalysis } =
    useSeoAnalyzer(stepsConfig, doc);

  useEffect(() => {
    if (showAnalysis) runAnalysis();
  }, [showAnalysis]);

  // --- Helper for step icon ---
  const getStepIcon = (status, isActive) => {
    if (status === "success")
      return <Icon source={CheckCircleIcon} tone="success" />;
    if (status === "error") return <Icon source={XCircleIcon} tone="critical" />;
    if (isActive) return <Icon source={ClockIcon} tone="subdued" />;
    return <Icon source={NoteIcon} tone="subdued" />;
  };

  const progress =
    ((Object.keys(statuses).length / stepsConfig.length) * 100).toFixed(0);

  // --- When user hasn’t started analysis ---
  if (!showAnalysis)
    return (
      <Card sectioned>
        <BlockStack gap="3">
          <Text variant="headingMd">SEO Analyzer</Text>
          <Text tone="subdued">
            Click “Start Analyze” to begin the SEO evaluation.
          </Text>
        </BlockStack>
      </Card>
    );

  // --- Main UI (same as your previous version, refactored) ---
  return (
    <Card>
      <BlockStack gap="4" padding="400">
        {/* Header + Run Again Button */}
        <InlineStack align="space-between">
          <Text variant="headingMd">SEO Analyzer</Text>
          {isDone && (
            <Button onClick={onRestart} size="slim">
              Run Again
            </Button>
          )}
        </InlineStack>

        {/* Progress Bar */}
        <ProgressBar progress={progress} />

        {/* Vertical Stepper */}
        {/* <BlockStack gap="5">
          {stepsConfig.map((step, i) => {
            const status = statuses[step.key];
            const isActive = currentStep === i && !isDone;

            const stepBg =
              status === "success"
                ? "var(--p-color-success-subdued)"
                : status === "error"
                ? "var(--p-color-critical-subdued)"
                : "var(--p-color-bg-surface-secondary)";

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  backgroundColor: stepBg,
                  borderRadius: "var(--p-border-radius-200)",
                  padding: "1rem",
                }}
              >
                <BlockStack gap="2" align="start">
                  <InlineGrid columns={["oneThird", "twoThirds"]} gap="200">
                    {getStepIcon(status, isActive)}
                    <Text variant="headingSm" alignment="start">
                      {step.label}
                    </Text>
                    
                  </InlineGrid>
 
                  {isDone && (
                    <ExceptionList
                      items={generateExceptionItems(step.key, results, status)}
                    />
                  )}

                  {!isDone && isActive && (
                    <Text tone="subdued">Analyzing...</Text>
                  )}
                </BlockStack>
              </motion.div>
            );
          })}
        </BlockStack> */}

        {/* Summary Section */}
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
                  {results.headings && (
                    <Badge tone="success">
                      H1: {results.headings?.h1} | H2: {results.headings?.h2} |
                      H3: {results.headings?.h3}
                    </Badge>
                  )}

                  {results.links && (
                    <Badge tone="info">
                      Internal: {results.links?.internal} | External:{" "}
                      {results.links?.external}
                    </Badge>
                  )}

                  {results.images && (
                    <Badge tone="attention">
                      Alt Tag Coverage: {results.images?.coverage}%
                    </Badge>
                  )}

                  {results.meta && (
                    <>
                      <Badge tone="success">
                        Title: {results.meta?.title ? "OK" : "Missing"}
                      </Badge>
                      <Badge tone="success">
                        Description: {results.meta?.desc ? "OK" : "Missing"}
                      </Badge>
                    </>
                  )}
                </BlockStack>
              </BlockStack>
            </motion.div>
          </>
        )}
      </BlockStack>
    </Card>
  );
};

export default SeoAnalysis;
