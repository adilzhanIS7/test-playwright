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

## AI tool
Claude Code (CLI) with **Claude Opus 5.5** — see [Prompt.md](docs/Prompt.md) and [Review.md](docs/Review.md).

## Documentation
- [Description](docs/Description.md)
- [Test Cases](docs/TestCases.md)
- [Prompt](docs/Prompt.md)
- [Review](docs/Review.md)
