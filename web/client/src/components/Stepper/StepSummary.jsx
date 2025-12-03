import React from 'react';
import { Card, ExceptionList, Text } from '@shopify/polaris';
import { NoteIcon } from '@shopify/polaris-icons';

const StepSummary = ({ step }) => {
  if (!step) return null;

  const { summary, title, status } = step;

  return (
    <Card sectioned>
      <Text as="h2" variant="headingMd">
        {title} Summary
      </Text>
      <ExceptionList
        items={[
          {
            icon: NoteIcon,
            description: summary,
          },
          {
            icon: NoteIcon,
            description:
              status === 'success'
                ? 'All checks passed successfully.'
                : status === 'warning'
                ? 'Some improvements recommended.'
                : 'Requires immediate attention.',
          },
        ]}
      />
    </Card>
  );
};

export default StepSummary;
