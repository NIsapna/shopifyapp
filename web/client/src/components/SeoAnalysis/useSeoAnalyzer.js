// useSeoAnalyzer.js
import { useState } from "react";

export const useSeoAnalyzer = (stepsConfig, doc) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState({});
  const [statuses, setStatuses] = useState({});
  const [isDone, setIsDone] = useState(false);

  const runAnalysis = async () => {
    setCurrentStep(0);
    setResults({});
    setStatuses({});
    setIsDone(false);

    for (let i = 0; i < stepsConfig.length; i++) {
      const step = stepsConfig[i];
      setCurrentStep(i);

      await new Promise((r) => setTimeout(r, 1000));

      if (!doc) continue;

      const { passed, result } = step.run(doc);
      setResults((prev) => ({ ...prev, [step.key]: result }));
      setStatuses((prev) => ({ ...prev, [step.key]: passed ? "success" : "error" }));
    }

    setIsDone(true);
  };

  return { currentStep, results, statuses, isDone, runAnalysis };
};
