import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParameterForm } from '../components/ParameterForm';
import type { SimulationConfig } from '../types';
import { DEFAULT_CONFIG } from '../types';

describe('ParameterForm', () => {
  it('renders all sections', () => {
    render(<ParameterForm config={{ ...DEFAULT_CONFIG }} onChange={() => {}} />);
    expect(screen.getByTestId('parameter-form')).toBeInTheDocument();
    expect(screen.getByLabelText(/Fluid Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Power/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Plate Length/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/OHP Turns/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time Step/i)).toBeInTheDocument();
  });

  it('calls onChange when power is updated', async () => {
    const user = userEvent.setup();
    const calls: SimulationConfig[] = [];
    render(
      <ParameterForm
        config={{ ...DEFAULT_CONFIG }}
        onChange={(c) => { calls.push(c); }}
      />
    );
    const powerInput = screen.getByLabelText(/Power/i);
    await user.clear(powerInput);
    await user.type(powerInput, '100');
    // onChange should have been called multiple times (once per keystroke)
    expect(calls.length).toBeGreaterThan(0);
    // Each call should contain a numeric power value
    calls.forEach((c) => expect(typeof c.power).toBe('number'));
  });

  it('calls onChange when fluid type is changed', async () => {
    const user = userEvent.setup();
    let updated: SimulationConfig | null = null;
    render(
      <ParameterForm
        config={{ ...DEFAULT_CONFIG }}
        onChange={(c) => { updated = c; }}
      />
    );
    const select = screen.getByLabelText(/Fluid Type/i);
    await user.selectOptions(select, 'Ethanol');
    expect(updated!.fluid_type).toBe('Ethanol');
  });
});
