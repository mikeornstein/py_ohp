# OscillatingHeatPipe
tools for numerical simulation of oscillating heat pipes

[![Build Status](https://github.com/liyuxuan48/OscillatingHeatPipe/workflows/CI/badge.svg)](https://github.com/liyuxuan48/OscillatingHeatPipe/actions)
[![Coverage](https://codecov.io/gh/liyuxuan48/OscillatingHeatPipe/branch/master/graph/badge.svg)](https://codecov.io/gh/liyuxuan48/OscillatingHeatPipe)

## How It Works (Linear Execution Flow)

The numerical simulation of the Oscillating Heat Pipe (OHP) executes sequentially to initialize the coupled solid-fluid system, followed by a weakly-coupled temporal integration loop:

1. **Parameters & Geometry Setup**
   - Solid plate and fluid physical properties (e.g. saturation limits, density, conductivity) are initialized.
   - The 2D computational domain representing the solid plate is uniformly meshed as a Cartesian grid (`PhysicalGrid`).

2. **Boundary Conditions & Forcing Models**
   - Heating zones (evaporators) and cooling boundary conditions (condensers) are mapped using shape objects and assigned respective thermal equations (`AreaForcingModel`).
   - The multi-turn serpentine geometry of the OHP channels is defined as a 1D curve and coupled to the plate as an immersed line heat source (`LineForcingModel`).

3. **System Construction**
   - **Solid Plate System**: Constructed primarily as a 2D `NeumannHeatConductionProblem`. Immersed boundary methods are used to represent the exact layout of the heaters, condensers, and the OHP.
   - **OHP Fluid System (`PHPSystem`)**: Constructed using `initialize_ohpsys`. It captures the 1D fluid dynamics using an alternating liquid slug and vapor plug model. Mass, momentum, and energy conservation equations are embedded here (`dynamicsmodel` and `liquidmodel`).

4. **Time-Marching Integration**
   - Initial states for both networks are populated into corresponding ODE integrators (`integrator_plate` and `integrator_tube`).
   - The simulation marches forward over time in discrete steps (`timemarching!`).
   - Within each master step, the 1D fluid system and 2D solid system advance iteratively in parallel using Julia multithreading (`@sync @spawn step!`).
   - **Information Exchange:** Following the discrete step, data is exchanged between systems: the solid plate provides the local wall temperatures interpolated along the tube's 1D coordinates, and the fluid system computes interface heat fluxes (via fluid boiling, condensation, and sensible heat) transferring them back to the plate as boundary fluxes.

5. **Post-Processing**
   - System state history is continuously sampled into a `SimulationResult` buffer and saved to disk. Later, one or more rendering routines read the output data to animate temperatures and slug phase distributions.
