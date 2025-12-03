import React from 'react';
import { Card, SkeletonBodyText, SkeletonDisplayText } from '@shopify/polaris';

const TableSkeleton = () => (
  <Card sectioned>
    <SkeletonDisplayText size="small" />
    <SkeletonBodyText lines={6} />
  </Card>
);

export default TableSkeleton;
