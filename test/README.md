# OscillatingHeatPipe.jl Test Suite

This directory contains the test suite for the `OscillatingHeatPipe.jl` project. The tests are designed to cover a wide range of functionalities, from unit-testing empirical thermal correlations and abstract data structures to full numerical integration and weakly-coupled system simulations.

## Test Structure

The main entry point for the test suite is `runtests.jl`. It uses the `GROUP` environment variable to determine which subset of tests to execute. If no group is specified, it defaults to running `All` tests.

The tests are broadly divided into two main categories:

### 1. Auxiliary/Component Tests (`GROUP="Auxiliary"`)
These tests rigorously evaluate the project's internal physical models, ODE formulations, solver callbacks, and data structures.

- **`correlations.jl`**: Unit tests for empirical fluid and thermal correlations used throughout the solver. Includes:
  - Liquid film thickness correlation (Aussillous and Quere, 2000).
  - Churchill friction factor for mapping Reynolds number to pressure drops.
  - Boiling superheat temperature thresholds ($\Delta T$) using the Qu and Ma correlation.
- **`datastructures.jl`**: Tests the integrity and conservation properties of the `PHPSystem` data structures.
  - Validates the calculation of liquid slug lengths, vapor plug lengths, and continuous mass tracking (liquid mass, vapor mass, and film mass).
  - Ensures accurate geometric mapping, area calculations, and structural assembly/disassembly (`Xtovec`, `vectoXMδL`).
- **`thermomodel.jl` & `integrator.jl`**: Comprehensive tests for the core system thermodynamics and time-marching execution.
  - Validates the `dynamicsmodel` (1D mass, momentum, and energy ODEs) and `liquidmodel` (heat conduction within slugs) under controlled conditions, like varying initial velocities, gravity, or pre-existing film thicknesses.
  - Tests explicitly the boundary condition discrete callbacks (`DiscreteCallback`), including:
    - `boiling_condition`/`boiling_affect!`: Simulating bubble nucleation.
    - `merging_condition`: Dealing with liquid/vapor slug merging during operation.
    - `fixdx_condition` and `slugbc_condition`: Fixing discrete numerical stability nodes.
  - Tests the weakly-coupled "Jacobi-style" explicit time stepping between the 1D fluid domain and the 2D solid plate domain.

### 2. Literate Integration Tests (`GROUP="Literate"`, `"Notebooks"`, `"Documentation"`)
This suite utilizes `Literate.jl` to serve a dual purpose: it acts as end-to-end integration tests while generating the project's interactive examples, notebooks, and markdown documentation.

- **`literate/` directory**: Contains standard Julia scripts (`.jl`) written with markdown-style comments (e.g., `OHP DIY.jl`, `OHP simulation.jl`).
- When tested through `runtests.jl`, these are executed to ensure that setting up complex geometry (e.g., ASETS-II serpentine channels), applying boundary heat conditions, initializations, and marching the fully coupled system succeeds without crashing. 
- For notebook and documentation generation, `Literate.jl` compiles these into interactive Jupyter Notebooks inside the `examples/` directory and Markdown files inside `docs/src/manual/`.

## Running the Tests

To run the full test suite locally, use the Julia package manager `Pkg` from the root directory of the project:

```bash
julia --project -e 'using Pkg; Pkg.test()'
```
