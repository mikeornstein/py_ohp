# OHP Web Frontend

This is the React-based frontend for the Oscillating Heat Pipe (OHP) simulation tool. It uses Vite, TypeScript, and TailwindCSS v4.

## Quick Start

### Installation
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## Testing

### Unit Tests (Vitest)
```bash
npm run test
```

### End-to-End Tests (Playwright)
```bash
npx playwright test
```

## Configuration

- **Proxy**: API requests are proxied to the Julia backend (default: `localhost:8080`) via `vite.config.ts`.
- **Styling**: Uses TailwindCSS v4. Core design system tokens are in `src/index.css`.
- **Visualization**: Geometry previews are rendered using standard HTML5 Canvas.
