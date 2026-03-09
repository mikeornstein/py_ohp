import React, { useState, useCallback, useRef } from 'react';
import type { SimulationConfig, JobStatus } from '../types';
import { submitSimulation, getJobStatus } from '../api';

interface Props {
  config: SimulationConfig;
}

export const SimulationDashboard: React.FC<Props> = ({ config }) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((jid: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const s = await getJobStatus(jid);
        setStatus(s);
        if (s.status === 'completed' || s.status === 'failed') {
          stopPolling();
        }
      } catch (err) {
        setError(String(err));
        stopPolling();
      }
    }, 2000);
  }, [stopPolling]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    setStatus(null);
    setJobId(null);

    try {
      const res = await submitSimulation(config);
      setJobId(res.job_id);
      setStatus({ status: 'running', progress: 0, result: null, error: null });
      startPolling(res.job_id);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }, [config, startPolling]);

  return (
    <div className="card" data-testid="simulation-dashboard" style={{ marginTop: 16 }}>
      <div className="form-section-title">Simulation Control</div>

      <button
        id="run-simulation"
        className="btn-primary"
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {submitting ? 'Submitting…' : '▶ Run Simulation'}
      </button>

      {error && (
        <div style={{ color: 'var(--color-accent-red)', marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      {jobId && (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          Job ID: <code>{jobId}</code>
        </div>
      )}

      {status && (
        <div>
          <span className={`status-badge ${status.status}`} data-testid="status-badge">
            {status.status === 'running' && <span className="spinner" />}
            {status.status}
          </span>

          {status.status === 'running' && (
            <div style={{ marginTop: 12 }}>
              <div style={{
                height: 6,
                background: 'var(--color-bg-input)',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${status.progress}%`,
                  background: 'linear-gradient(90deg, var(--color-accent-blue), var(--color-accent-cyan))',
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          {status.status === 'completed' && status.result && (
            <div style={{ marginTop: 16 }}>
              <div className="form-section-title">Results</div>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Simulation completed successfully. Output saved to:
              </p>
              <code style={{
                display: 'block',
                background: 'var(--color-bg-input)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                marginTop: 8,
                wordBreak: 'break-all',
              }}>
                {status.result}
              </code>
              {/* Future: interactive post-processing viewer goes here */}
            </div>
          )}

          {status.status === 'failed' && status.error && (
            <div style={{ marginTop: 12, color: 'var(--color-accent-red)', fontSize: 13 }}>
              Error: {status.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
