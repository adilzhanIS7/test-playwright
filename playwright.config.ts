import { defineConfig, devices } from '@playwright/test';

// GitHub Actions sets CI=true automatically. Without it the config behaves as before on a dev machine.
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,            // shards split tests, not whole files
  forbidOnly: isCI,               // a forgotten test.only fails CI
  retries: isCI ? 2 : 1,          // in CI a flaky test is marked flaky, not red
  workers: isCI ? 2 : 4,          // GitHub runners have 2-4 vCPUs
  reporter: isCI
    ? [
        ['list'],
        ['blob'],                                        // merged into one HTML report by the merge job
        ['junit', { outputFile: 'reports/junit.xml' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ],
  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',
    // CI: trace of exactly the retried attempt. Locally: keep the trace of every failed test.
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Video is off locally: 'retain-on-failure' still RECORDS every test, and encoding
    // 4 parallel videos on Windows made context teardown take 25-56 s (tests timed out).
    // The Linux runner with 2 workers handles it fine.
    video: isCI ? 'retain-on-failure' : 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
