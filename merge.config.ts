// Used by `npx playwright merge-reports --config merge.config.ts ./all-blob-reports`
// to build one HTML report and one JUnit file from the blob reports of all shards.
export default {
  testDir: './tests',
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'reports/junit-merged.xml' }],
  ],
};
