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

**Runner:** the test shards run on a **self-hosted runner** (Windows PC, 4 runner instances so the
4 shards run in parallel). On GitHub-hosted `ubuntu-latest` runners practicesoftwaretesting.com
shows a bot-check page ("…verifies you are not a bot") instead of the app to data-centre IPs, so every
test that logs in failed there, retries included (seen in `error-context.md` of the first CI run).
The `merge-reports` job does not open the site and stays on `ubuntu-latest`.

**Pipeline** (`.github/workflows/playwright.yml`):
- runs on every push and pull request (plus manual `workflow_dispatch` for timing runs);
- `npm ci` with the npm cache (`actions/setup-node`, `cache: npm`), Chromium installed with system dependencies;
- the full Playwright suite split into 4 shards (`--shard=i/4`) running in parallel, no `--grep` / `--project` filters;
- the `merge-reports` job merges the shards' blob reports into one HTML report and one JUnit file;
- artefacts: `playwright-report` (HTML), `test-results-N` (traces, screenshots, JUnit), `junit-report`; kept for 14 days.

**CI settings** (`playwright.config.ts`, when `CI=true`): `forbidOnly: true`, `retries: 2`, `workers: 2`,
reporters `list`, `blob`, `junit` (`reports/junit.xml`), `trace: 'on-first-retry'` (video only on Linux runners).
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
| 1 job, no sharding | **2m 1s** (2m 13s / 1m 53s / 2m 1s) | **53s** (53 / 48 / 59 s) | [run 43591499164](https://github.com/adilzhanIS7/test-playwright/actions/runs/43591499164), attempts 1–3 |
| 4 shards + merge | **1m 41s** (2m 18s / 1m 39s / 1m 41s) | **29s** (41 / 29 / 27 s) | [run 43592264960](https://github.com/adilzhanIS7/test-playwright/actions/runs/43592264960), attempts 2–4 |

Median of 3 runs of the same commit, started one at a time with **Re-run all jobs** (nothing else
running on the runners). For the 4-shard row attempt 1 is left out: it saved the npm cache for the
first time and ran next to the pull-request run. In attempts 2–4 the npm cache was restored in all 4 shards.

**Conclusion:** sharding cut the test step from 53 s to 29 s (−45 %), but the whole run only from
2m 1s to 1m 41s (−17 %): every shard still spends the same ~40–60 s on checkout, Node setup, `npm ci`
and the browser check, the extra `merge-reports` job adds ~15–20 s, and all 4 shards share one PC and
the same remote site, so 4 shards are not 4× faster. With 26 tests that take under a minute, sharding
gives a modest gain; it pays off more as the suite grows.

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
