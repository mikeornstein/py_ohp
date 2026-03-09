/** Shared types for the OHP web frontend */

export interface SimulationConfig {
  fluid_type: string;
  power: number;
  tstep: number;
  tspan: [number, number];
  dt_record: number;
  Lx: number;
  Ly: number;
  heater_size: number;
  condenser_size_x: number;
  condenser_size_y: number;
  turns: number;
}

export interface JobStatus {
  status: 'running' | 'completed' | 'failed';
  progress: number;
  result: string | null;
  error: string | null;
}

export const DEFAULT_CONFIG: SimulationConfig = {
  fluid_type: 'Butane',
  power: 70,
  tstep: 1e-3,
  tspan: [0.0, 1.0],
  dt_record: 0.2,
  Lx: 0.155,
  Ly: 0.053,
  heater_size: 0.05,
  condenser_size_x: 0.015,
  condenser_size_y: 0.0254,
  turns: 9,
};
