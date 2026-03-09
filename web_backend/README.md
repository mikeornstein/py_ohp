# OHP Web Backend

This is the Julia-based backend for the Oscillating Heat Pipe (OHP) simulation tool. It uses Oxygen.jl for the API layer and provides a headless runner for simulations.

## Quick Start

### Start the Server
```bash
~/.juliaup/bin/julia --project=. server.jl
```
The server listens on `http://0.0.0.0:8080` by default.

## API Endpoints

- `GET /health`: Health check.
- `POST /api/simulate`: Submit a new simulation job with a JSON config.
- `GET /api/status/{job_id}`: Poll for the status and result of a simulation job.

## Testing

### Run All Tests
```bash
~/.juliaup/bin/julia --project=. -e 'using Pkg; Pkg.test()'
```
The test suite includes:
- **Unit Tests**: Verification of the `SimulationRunner` logic.
- **Integration Tests**: Full API lifecycle testing (server startup, request handling, job processing).

## Architecture

- `server.jl`: Entry point and API route definitions.
- `src/simulation_runner.jl`: Logic for executing simulations headlessly and saving results.
- `src/output/`: Directory where simulation results (TXT files) are stored.
