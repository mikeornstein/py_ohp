import React, { useRef, useEffect } from 'react';
import type { SimulationConfig } from '../types';

interface Props {
  config: SimulationConfig;
}

/**
 * GeometryPreview renders a 2D canvas visualization of the OHP plate,
 * heater, condenser, and serpentine channel layout based on the current
 * config parameters. This gives the user visual feedback before running
 * the simulation.
 */
export const GeometryPreview: React.FC<Props> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Compute scale: fit the plate into the canvas with padding
    const pad = 40;
    const scaleX = (W - 2 * pad) / config.Lx;
    const scaleY = (H - 2 * pad) / config.Ly;
    const scale = Math.min(scaleX, scaleY);

    // Origin at center of canvas
    const cx = W / 2;
    const cy = H / 2;

    const toCanvas = (xm: number, ym: number): [number, number] => [
      cx + xm * scale,
      cy - ym * scale, // flip y
    ];

    // Draw plate outline
    const [px1, py1] = toCanvas(-config.Lx / 2, -config.Ly / 2);
    const plateW = config.Lx * scale;
    const plateH = config.Ly * scale;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(px1, py1 - plateH, plateW, plateH);

    // Draw grid lines (subtle)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    const gridStep = 0.01; // 1cm grid
    for (let gx = -config.Lx / 2; gx <= config.Lx / 2; gx += gridStep) {
      const [x1, y1] = toCanvas(gx, -config.Ly / 2);
      const [x2, y2] = toCanvas(gx, config.Ly / 2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    for (let gy = -config.Ly / 2; gy <= config.Ly / 2; gy += gridStep) {
      const [x1, y1] = toCanvas(-config.Lx / 2, gy);
      const [x2, y2] = toCanvas(config.Lx / 2, gy);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw heater (red semi-transparent rect at center)
    const hs = config.heater_size;
    const [hx, hy] = toCanvas(-hs / 2, -hs / 2);
    ctx.fillStyle = 'rgba(248, 113, 113, 0.35)';
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.fillRect(hx, hy - hs * scale, hs * scale, hs * scale);
    ctx.strokeRect(hx, hy - hs * scale, hs * scale, hs * scale);

    // Label
    ctx.fillStyle = '#f87171';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    const [labelHx, labelHy] = toCanvas(0, 0);
    ctx.fillText('Heater', labelHx, labelHy + 4);

    // Draw condenser (blue rect, offset to the right like the DIY notebook)
    const condXCenter = 2.4 * 0.0254; // 2.4 INCHES in meters
    const csx = config.condenser_size_x;
    const csy = config.condenser_size_y;
    const [ccx, ccy] = toCanvas(condXCenter - csx / 2, -csy / 2);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(ccx, ccy - csy * scale, csx * scale, csy * scale);
    ctx.strokeRect(ccx, ccy - csy * scale, csx * scale, csy * scale);

    const [labelCx, labelCy] = toCanvas(condXCenter, 0);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Condenser', labelCx, labelCy + 4);

    // Draw OHP serpentine channel approximation
    const nturn = config.turns;
    const widthOhp = 46.25e-3;
    const lengthOhp = 147.0e-3;
    const pitch = widthOhp / (2 * nturn + 1);

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1.2;
    ctx.beginPath();

    // Approximate serpentine: vertical lines connected by U-bends
    const xStart = -lengthOhp / 2;
    let direction = 1; // 1 = up, -1 = down

    for (let i = 0; i < 2 * nturn; i++) {
      // Draw a horizontal line (rotated 90 degrees based on the DIY notebook)
      const yChannel = -widthOhp / 2 + i * pitch;
      if (direction === 1) {
        const [lx1, ly1] = toCanvas(xStart, yChannel);
        const [lx2, ly2] = toCanvas(xStart + lengthOhp, yChannel);
        if (i === 0) ctx.moveTo(lx1, ly1);
        else ctx.lineTo(lx1, ly1);
        ctx.lineTo(lx2, ly2);
      } else {
        const [lx1, ly1] = toCanvas(xStart + lengthOhp, yChannel);
        const [lx2, ly2] = toCanvas(xStart, yChannel);
        ctx.lineTo(lx1, ly1);
        ctx.lineTo(lx2, ly2);
      }
      direction *= -1;
    }
    ctx.stroke();

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '10px Inter, sans-serif';
    const legendX = 12;
    let legendY = H - 60;

    ctx.fillStyle = '#f87171';
    ctx.fillRect(legendX, legendY, 10, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Heater', legendX + 16, legendY + 9);
    legendY += 16;

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(legendX, legendY, 10, 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Condenser', legendX + 16, legendY + 9);
    legendY += 16;

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 5);
    ctx.lineTo(legendX + 10, legendY + 5);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('OHP Channel', legendX + 16, legendY + 9);

  }, [config]);

  return (
    <div className="canvas-container" data-testid="geometry-preview">
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
};
