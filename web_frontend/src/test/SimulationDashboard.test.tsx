import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimulationDashboard } from '../components/SimulationDashboard';
import { DEFAULT_CONFIG } from '../types';

describe('SimulationDashboard', () => {
  it('renders the run button', () => {
    render(<SimulationDashboard config={{ ...DEFAULT_CONFIG }} />);
    expect(screen.getByTestId('simulation-dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run Simulation/i })).toBeInTheDocument();
  });

  it('run button is not disabled by default', () => {
    render(<SimulationDashboard config={{ ...DEFAULT_CONFIG }} />);
    const btn = screen.getByRole('button', { name: /Run Simulation/i });
    expect(btn).not.toBeDisabled();
  });
});
