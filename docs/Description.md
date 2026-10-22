# Project Description

## 1. Goal
Build an automated end-to-end (E2E) UI regression pack for the demo e-commerce
application **Toolshop** — <https://practicesoftwaretesting.com/> — using
**Playwright Test + TypeScript**.

The code is generated with an AI assistant (see [Prompt.md](Prompt.md)) and then
reviewed, run, debugged and refined by hand (see [Review.md](Review.md)). The
goal of the assignment is not only to have working tests, but to show how AI
output is critically evaluated and improved by a QA engineer.

## 2. Application under test
| Item | Value |
|------|-------|
| URL (UI) | https://practicesoftwaretesting.com |
| URL (API) | https://api.practicesoftwaretesting.com |
| Version | Toolshop v5.0 (Angular SPA + Laravel REST API) |
| Type | Public demo web shop for tools (catalog, cart, checkout, user account) |

## 3. Scope — 5 automated test suites
| # | Suite | What is covered | Spec file |
|---|-------|-----------------|-----------|
| 1 | **Authentication** | Valid login, invalid credentials, required fields, logout | `tests/auth.spec.ts` |
| 2 | **Registration** | Successful sign-up, required fields, duplicate email, email/password validation | `tests/register.spec.ts` |
| 3 | **Product Search & Filter** | Keyword search, no results, reset, category filter, sorting by price / name | `tests/search.spec.ts` |
| 4 | **Product Details & Cart** | Product page, add to cart, quantity, update/remove in cart, totals | `tests/cart.spec.ts` |
| 5 | **Checkout** | Full order flow, payment confirmation, invoice in account, guest options | `tests/checkout.spec.ts` |

Detailed test cases: [TestCases.md](TestCases.md) (26 TCs).

### Out of scope
- Non-functional testing (performance, load, security, accessibility audits).
- Cross-browser matrix — Chromium only (Firefox/WebKit can be enabled in config).
- Admin panel, favorites, product comparison, rentals, contact form, i18n.
- Real payment providers (the site simulates payments).

## 4. Approach
- **Framework:** Playwright Test runner, TypeScript, Node.js 22.
- **Design pattern:** Page Object Model (`pages/`) — tests describe *behaviour*,
  page objects hold *locators and actions*.
- **Locators:** the app exposes stable `data-test` attributes on almost every
  element, so `testIdAttribute: 'data-test'` is set in the config and
  `page.getByTestId()` is the primary locator strategy. Text/role locators only
  where no `data-test` exists (e.g. cart "delete" button).
- **Test data:** every test that needs an account creates a **fresh unique user
  through the public REST API** (`POST /users/register`) instead of using the
  shared demo accounts (see risks below). UI registration itself is tested in
  the Registration suite.
- **Login for non-auth tests:** checkout tests log in through the API
  (`POST /users/login`) and put the token into `localStorage["auth-token"]`
  before the page loads. The login form is tested once, in the Authentication
  suite, and is not repeated in every checkout test.
- **Code layout:** `models/` (domain types shared by pages and tests),
  `pages/` (page objects), `tests/helpers/` (fixtures, API, test data, prices).
- **Synchronisation:** web-first assertions (`expect(...).toHaveText()`,
  `toHaveURL()`) and waiting for specific API responses — **no hard-coded
  `waitForTimeout()`** in tests.
- **Independence:** each test runs in its own browser context and can run in
  parallel and in any order.
- **Reporting:** `list` reporter in console + Playwright HTML report; screenshot,
  video and trace are kept on failure.

## 5. Findings from manual exploration (before writing tests)
These facts were checked against the live site and shaped the test design:

1. **Shared demo accounts get locked.** After a couple of wrong-password
   attempts, `customer@practicesoftwaretesting.com` returned
   *"Account locked, too many failed attempts. Please contact the administrator."*
   These accounts are shared by everyone on the internet, so tests must not
   depend on them → use self-registered users.
2. Wrong password / unknown email → `data-test="login-error"`:
   *"Invalid email or password"*.
3. Successful login redirects to `/account` with heading *"My account"*; the user
   menu (`nav-menu`) shows the user's full name.
4. UI registration redirects to `/auth/login`. Duplicate email →
   *"A customer with this email address already exists."*
5. Search updates the product grid **asynchronously** — reading the grid too
   early returns the previous (unfiltered) results. Tests must wait for the
   search caption / API response.
6. Cart lives on `/checkout` as a 4-step wizard: *Cart → Sign in → Billing
   Address → Payment*. Payment is a two-click flow: **Check payment** →
   *"Payment was successful"* → **Confirm** →
   *"Thanks for your order! Your invoice number is INV-…"*.
7. The checkout "Sign in" step has two tabs. The guest form is hidden until
   the **Continue as Guest** tab is clicked.
8. The login token is stored in `localStorage` under `auth-token`.
9. Toast messages: *"Product added to shopping cart."*,
   *"Product quantity updated."*; empty cart shows *"The cart is empty. Nothing to display."*

## 6. Risks and mitigations
| Risk | Mitigation |
|------|------------|
| Public shared environment, data changed by other users | Unique test data per run (timestamped emails), no assumptions about global state |
| Account lockout on failed logins | Negative login tests use a fresh user or a non-existent email |
| Network latency / slow API | Web-first assertions with auto-wait, 1 retry locally, HTML trace on failure |
| UI text changes | Prefer `data-test` locators; assert exact text only for key business messages |

## 7. AI tool
- **Tool:** Claude Code (CLI, terminal agent)
- **Model:** Claude Opus 5.5 (`claude-opus-5-5`)
- Full prompt: [Prompt.md](Prompt.md). Review of the output: [Review.md](Review.md).

## 8. Deliverables
- Source code: `playwright.config.ts`, `pages/`, `tests/`
- Docs: `Description.md`, `TestCases.md`, `Prompt.md`, `Review.md`
- Evidence: `screenshots/` (AI responses, test run results, HTML report)
- Public GitHub repository (link in the root `README.md`)
