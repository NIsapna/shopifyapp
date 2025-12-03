import React, { useState } from 'react';
import { VerticalStack, Card, Text, Badge } from '@shopify/polaris';
import { CheckCircleIcon, XCircleIcon, AlertCircleIcon } from '@shopify/polaris-icons';
import StepSummary from './StepSummary';

const steps = [
  { id: 1, title: 'Title Tag Analysis', status: 'success', summary: 'Title length and keyword density are optimal.' },
  { id: 2, title: 'Meta Description', status: 'warning', summary: 'Meta description is slightly long, consider trimming.' },
  { id: 3, title: 'Readability Score', status: 'error', summary: 'Content uses too many complex sentences.' },
  { id: 4, title: 'Performance Check', status: 'success', summary: 'Good page load time and no major layout shifts.' },
];

const getIcon = (status) => {
  switch (status) {
    case 'success':
      return { icon: CheckCircleIcon, color: 'success' };
    case 'error':
      return { icon: XCircleIcon, color: 'critical' };
    case 'warning':
      return { icon: AlertCircleIcon, color: 'warning' };
    default:
      return {};
  }
};

const VerticalStepper = () => {
  const [activeStep, setActiveStep] = useState(steps[0]);

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      {/* Left: Stepper list */}
      <VerticalStack gap="2">
        {steps.map((step) => {
          const { icon: Icon, color } = getIcon(step.status);
          const isActive = activeStep.id === step.id;

          return (
            <Card
              key={step.id}
              background={isActive ? 'bg-surface-hover' : 'bg-surface'}
              onClick={() => setActiveStep(step)}
              sectioned
              tone={color}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon color={color} />
                <Text as="h3" variant="headingSm" tone={color}>
                  {step.title}
                </Text>
                <Badge tone={color}>{step.status}</Badge>
              </div>
            </Card>
          );
        })}
      </VerticalStack>

      {/* Right: Step Summary */}
      <div style={{ flex: 1 }}>
        <StepSummary step={activeStep} />
      </div>
    </div>
  );
};

export default VerticalStepper;
