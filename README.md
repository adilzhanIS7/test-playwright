# Toolshop E2E Automation (Playwright + TypeScript)

Automated UI test suites for the demo e-commerce site
[practicesoftwaretesting.com](https://practicesoftwaretesting.com/), generated with
an AI assistant and then reviewed and refined by hand.

## Test suites
1. Authentication
2. Registration
3. Product Search & Filter
4. Product Details & Cart
5. Checkout

## Project structure
```
models/         Domain types (User, Address)
pages/          Page Object Model classes
tests/          Test specs (one file per suite)
docs/           Description.md, TestCases.md, Prompt.md, Review.md
screenshots/    AI responses and test run results
```

## How to run
```bash
npm install
npx playwright install chromium   # first time only
npm test                          # run all tests (headless)
npm run test:headed               # run with a visible browser
npm run report                    # open the HTML report
```

## Result
26 tests, 5 suites — **26/26 passed** (Chromium), stability run **52/52** (`--repeat-each=2 --retries=0`).

| Evidence | File |
|----------|------|
| Final run in terminal | [terminal-report.png](screenshots/run-results/terminal-report.png) |
| HTML report | [html-report.png](screenshots/run-results/html-report.png), [html-report-steps.png](screenshots/run-results/html-report-steps.png) |
| Type check | [type-check.png](screenshots/run-results/type-check.png) |
| AI responses | [screenshots/ai-responses/](screenshots/ai-responses/) |
| Raw run logs (first failing run → final) | [screenshots/run-results/logs/](screenshots/run-results/logs/) |

## CI

[![Playwright Tests](https://github.com/adilzhanIS7/test-playwright/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/adilzhanIS7/test-playwright/actions/workflows/playwright.yml)

**CI system:** GitHub Actions. The repository already lives on GitHub, so it needs no server of its
own, is free for public repositories and supports matrices for sharding.

**Pipeline** (`.github/workflows/playwright.yml`):
- runs on every push and pull request (plus manual `workflow_dispatch` for timing runs);
- `npm ci` with the npm cache (`actions/setup-node`, `cache: npm`), Chromium installed with system dependencies;
- the full Playwright suite split into 4 shards (`--shard=i/4`) running in parallel, no `--grep` / `--project` filters;
- the `merge-reports` job merges the shards' blob reports into one HTML report and one JUnit file;
- artefacts: `playwright-report` (HTML), `test-results-N` (traces, screenshots, videos, JUnit), `junit-report`; kept for 14 days.

**CI settings** (`playwright.config.ts`, when `CI=true`): `forbidOnly: true`, `retries: 2`, `workers: 2`,
reporters `list`, `blob`, `junit` (`reports/junit.xml`), `trace: 'on-first-retry'`, `video: 'retain-on-failure'`.
`merge.config.ts` builds the merged HTML report and `reports/junit-merged.xml`.

**Configuration through environment** (all optional, defaults are in the code):

| Variable | Where on GitHub | Default |
| --- | --- | --- |
| `BASE_URL` | Actions → Variables | `https://practicesoftwaretesting.com` |
| `API_URL` | Actions → Variables | `https://api.practicesoftwaretesting.com` |
| `TEST_USER_PASSWORD` | Actions → Secrets | password of the throwaway users the tests register |

### Runtime

| Configuration | Total run time | Run tests step (slowest shard) | Run |
| --- | --- | --- | --- |
| 1 job, no sharding | TODO | TODO | [run](TODO) |
| 4 shards + merge | TODO | TODO | [run](TODO) |

Median of 3 runs via workflow_dispatch. Conclusion: TODO

### Running locally

```bash
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test                       # PowerShell: $env:CI="true"; npx playwright test; Remove-Item Env:CI
```

Shards + merge, as in CI:

```bash
mkdir -p all-blob-reports
CI=true npx playwright test --shard=1/2 && cp blob-report/*.zip all-blob-reports/
CI=true npx playwright test --shard=2/2 && cp blob-report/*.zip all-blob-reports/
npx playwright merge-reports --config merge.config.ts ./all-blob-reports
npx playwright show-report
```

## AI tool
Claude Code (CLI) with **Claude Opus 5.5** — see [Prompt.md](docs/Prompt.md) and [Review.md](docs/Review.md).

## Documentation
- [Description](docs/Description.md)
- [Test Cases](docs/TestCases.md)
- [Prompt](docs/Prompt.md)
- [Review](docs/Review.md)
