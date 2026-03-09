import { test, expect } from '@playwright/test';

test('run simulation through full lifecycle', async ({ page }) => {
  // Capture console logs from browser
  page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));

  // Navigate to the app
  await page.goto('/');

  // Verify initial state - check the title
  await expect(page.locator('h1')).toContainText('OHP Simulator');
  
  // Wait for the form to be interactive
  await expect(page.getByLabel('Power (W)')).toBeVisible();

  // Find and click the Run Simulation button
  const runButton = page.getByRole('button', { name: /Run Simulation/i });
  await runButton.click();

  // Verify it starts running - should show a Job ID and RUNNING badge
  console.log('Submitting simulation...');
  await expect(page.getByText(/Job ID:/i)).toBeVisible();
  await expect(page.getByTestId('status-badge')).toHaveText(/running/i);
  console.log('Simulation started, polling for completion...');

  // Wait for completion (with a long timeout for simulation)
  // The backend takes ~60-90s for a standard run, so 3 minutes is safe
  await expect(page.getByTestId('status-badge')).toHaveText(/completed/i, { timeout: 180000 });
  console.log('Simulation completed!');

  // Verify success message and result path
  await expect(page.getByText('Simulation completed successfully')).toBeVisible();
  await expect(page.getByText(/sim_result_.*\.txt/)).toBeVisible();
});
