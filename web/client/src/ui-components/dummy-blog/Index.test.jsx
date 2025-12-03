/**
 * Minimal unit test for DummyBlogScreen component
 * 
 * Note: This test requires a testing framework to be set up.
 * To run this test, install the following dependencies:
 * 
 * npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
 * 
 * Then add to package.json:
 * "scripts": {
 *   "test": "vitest"
 * }
 * 
 * Or use Jest/React Testing Library with similar setup.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DummyBlogScreen from './Index';

// Mock Polaris components for testing
vi.mock('@shopify/polaris', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  Layout: ({ children }) => <div data-testid="layout">{children}</div>,
  'Layout.Section': ({ children }) => <div data-testid="layout-section">{children}</div>,
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  Text: ({ children }) => <span>{children}</span>,
  Box: ({ children }) => <div>{children}</div>,
  DataTable: ({ rows }) => <table data-testid="data-table">{rows && <tbody><tr>{rows[0]}</tr></tbody>}</table>,
  InlineStack: ({ children }) => <div>{children}</div>,
  BlockStack: ({ children }) => <div>{children}</div>,
  InlineGrid: ({ children }) => <div>{children}</div>,
  Avatar: () => <div data-testid="avatar" />,
  Badge: ({ children }) => <span>{children}</span>,
  ProgressBar: () => <div data-testid="progress-bar" />,
  Icon: () => <div data-testid="icon" />,
}));

// Mock SEO components
vi.mock('../seo-panel/SeoScoreCard', () => ({
  default: () => <div data-testid="seo-score-card">SEO Score Card</div>,
}));

vi.mock('../seo-panel/SeoItem', () => ({
  default: () => <div data-testid="seo-item">SEO Item</div>,
}));

describe('DummyBlogScreen', () => {
  it('renders the list view by default', () => {
    render(<DummyBlogScreen />);
    
    expect(screen.getByText(/Blog Optimization Demo/i)).toBeInTheDocument();
    expect(screen.getByText(/View Details/i)).toBeInTheDocument();
  });

  it('shows detail view when View Details is clicked', () => {
    render(<DummyBlogScreen />);
    
    const viewButton = screen.getByText(/View Details/i);
    viewButton.click();
    
    expect(screen.getByText(/Blog SEO Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Back/i)).toBeInTheDocument();
  });

  it('returns to list view when Back is clicked', () => {
    render(<DummyBlogScreen />);
    
    // Click View Details
    const viewButton = screen.getByText(/View Details/i);
    viewButton.click();
    
    // Click Back
    const backButton = screen.getByText(/Back/i);
    backButton.click();
    
    expect(screen.getByText(/Blog Optimization Demo/i)).toBeInTheDocument();
  });
});

