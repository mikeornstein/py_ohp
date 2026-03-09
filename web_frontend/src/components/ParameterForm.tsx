import React from 'react';
import type { SimulationConfig } from '../types';

interface Props {
  config: SimulationConfig;
  onChange: (config: SimulationConfig) => void;
}

const FLUID_OPTIONS = ['Butane', 'Ethanol', 'Water', 'R134a', 'Ammonia'];

export const ParameterForm: React.FC<Props> = ({ config, onChange }) => {
  const update = <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="card" data-testid="parameter-form">
      {/* Material Properties */}
      <div className="form-section-title">Material Properties</div>

      <div className="form-group">
        <label htmlFor="fluid-type">Fluid Type</label>
        <select
          id="fluid-type"
          value={config.fluid_type}
          onChange={(e) => update('fluid_type', e.target.value)}
        >
          {FLUID_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="power">Power (W)</label>
        <input
          id="power"
          type="number"
          value={config.power}
          onChange={(e) => update('power', parseFloat(e.target.value) || 0)}
        />
      </div>

      {/* Geometry */}
      <div className="form-section-title" style={{ marginTop: 24 }}>Geometry</div>

      <div className="form-group">
        <label htmlFor="plate-lx">Plate Length – Lx (m)</label>
        <input
          id="plate-lx"
          type="number"
          step="0.001"
          value={config.Lx}
          onChange={(e) => update('Lx', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="plate-ly">Plate Width – Ly (m)</label>
        <input
          id="plate-ly"
          type="number"
          step="0.001"
          value={config.Ly}
          onChange={(e) => update('Ly', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="heater-size">Heater Size (m)</label>
        <input
          id="heater-size"
          type="number"
          step="0.001"
          value={config.heater_size}
          onChange={(e) => update('heater_size', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="condenser-x">Condenser X (m)</label>
        <input
          id="condenser-x"
          type="number"
          step="0.001"
          value={config.condenser_size_x}
          onChange={(e) => update('condenser_size_x', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="condenser-y">Condenser Y (m)</label>
        <input
          id="condenser-y"
          type="number"
          step="0.001"
          value={config.condenser_size_y}
          onChange={(e) => update('condenser_size_y', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="turns">OHP Turns</label>
        <input
          id="turns"
          type="number"
          min="1"
          max="20"
          value={config.turns}
          onChange={(e) => update('turns', parseInt(e.target.value) || 1)}
        />
      </div>

      {/* Temporal */}
      <div className="form-section-title" style={{ marginTop: 24 }}>Temporal</div>

      <div className="form-group">
        <label htmlFor="tstep">Time Step (s)</label>
        <input
          id="tstep"
          type="number"
          step="0.0001"
          value={config.tstep}
          onChange={(e) => update('tstep', parseFloat(e.target.value) || 1e-3)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tspan-end">Simulation Duration (s)</label>
        <input
          id="tspan-end"
          type="number"
          step="0.1"
          value={config.tspan[1]}
          onChange={(e) => update('tspan', [0, parseFloat(e.target.value) || 1])}
        />
      </div>

      <div className="form-group">
        <label htmlFor="dt-record">Recording Interval (s)</label>
        <input
          id="dt-record"
          type="number"
          step="0.01"
          value={config.dt_record}
          onChange={(e) => update('dt_record', parseFloat(e.target.value) || 0.2)}
        />
      </div>
    </div>
  );
};
