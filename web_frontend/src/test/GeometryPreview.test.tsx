import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GeometryPreview } from '../components/GeometryPreview';
import { DEFAULT_CONFIG } from '../types';

describe('GeometryPreview', () => {
  it('renders a canvas element', () => {
    render(<GeometryPreview config={{ ...DEFAULT_CONFIG }} />);
    expect(screen.getByTestId('geometry-preview')).toBeInTheDocument();
    const canvas = screen.getByTestId('geometry-preview').querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('canvas has expected dimensions', () => {
    render(<GeometryPreview config={{ ...DEFAULT_CONFIG }} />);
    const canvas = screen.getByTestId('geometry-preview').querySelector('canvas')!;
    expect(canvas.width).toBe(700);
    expect(canvas.height).toBe(500);
  });
});
