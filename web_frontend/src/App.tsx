import { useState } from 'react';
import './index.css';
import type { SimulationConfig } from './types';
import { DEFAULT_CONFIG } from './types';
import { ParameterForm } from './components/ParameterForm';
import { GeometryPreview } from './components/GeometryPreview';
import { SimulationDashboard } from './components/SimulationDashboard';

function App() {
  const [config, setConfig] = useState<SimulationConfig>({ ...DEFAULT_CONFIG });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>OHP Simulator</h1>
        <p>Oscillating Heat Pipe — Numerical Simulation Tool</p>
      </header>

      <div className="main-grid">
        {/* Left sidebar: inputs + run button */}
        <aside>
          <ParameterForm config={config} onChange={setConfig} />
          <SimulationDashboard config={config} />
        </aside>

        {/* Right main panel: geometry preview */}
        <main>
          <GeometryPreview config={config} />
        </main>
      </div>
    </div>
  );
}

export default App;
