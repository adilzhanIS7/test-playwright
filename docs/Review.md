# Review of the AI Results

**AI tool:** Claude Code (CLI) · **Model:** Claude Opus 5.5 · **Prompt:** [Prompt.md](Prompt.md)

This document has two parts:
1. **What the AI produced** and how it behaved: the first draft, the failures
   of the first run, and the fixes the AI made while debugging.
2. **My own review**: what I checked by hand, what I changed myself, and why.

---

## Part 1 — What the AI produced

### 1.1 Output of the main prompt
| Area | What was generated |
|------|--------------------|
| Page Objects (`pages/`) | `BasePage`, `LoginPage`, `RegisterPage`, `HomePage`, `ProductPage`, `CheckoutPage`, `InvoicesPage` |
| Specs (`tests/`) | `auth`, `register`, `search`, `cart`, `checkout` — 26 tests, one per TC, TC ID in each title |
| Helpers (`tests/helpers/`) | `fixtures.ts` (page objects + `freshUser` / `loggedInUser`), `users.ts` (unique user factory), `api.ts` (register via REST API), `price.ts` (price parsing) |

The prompt rules were followed: `getByTestId` locators, no shared demo accounts,
no `waitForTimeout`, independent tests, strict TypeScript (`tsc --noEmit` passed
on the first try).

### 1.2 First run of the AI draft — 19 passed / 7 failed
Log: [`screenshots/run-results/logs/run1.txt`](../screenshots/run-results/logs/run1.txt)

| # | Failing test(s) | Root cause | Type of mistake |
|---|-----------------|------------|-----------------|
| 1 | All 6 search/filter/sort tests | The AI **guessed** that the product API is called with `GET` and URL params (`?q=pliers`, `by_category`, `sort=`). It never checked. The site actually uses the rare HTTP **`QUERY`** method with the filters in the **JSON body**, so `waitForResponse` waited for a request that never came. | Hallucinated assumption about the app |
| 2 | TC-CHK-03 | The click on "Proceed" hung once under parallel load, although the page had already moved to the payment step. Did not happen again in 3 + 2 repeated runs. | Environment flakiness |

### 1.3 Problems found in later runs
| # | Problem | Root cause | Type of mistake |
|---|---------|------------|-----------------|
| 3 | TC-SRCH-01 always failed: `Expected /^[1-9]\d* products? found…$/, received " 4 products found for 'pliers' "` | `toHaveText(string)` trims whitespace, but `toHaveText(RegExp)` matches the raw text. The `^…$` anchors broke on the surrounding spaces. | Wrong knowledge of the framework API |
| 4 | TC-CART-06 failed: `add-to-cart` button `disabled` | The test opened "product #0 and #1 on the home page" without checking stock. Other cart tests already skipped "Out of stock" items, this one did not. | Inconsistency inside its own code |
| 5 | Cart/checkout tests took 45–78 s; 2 tests failed with *"Tearing down "context" exceeded the test timeout of 60000ms"* | The config from Stage 1 had `video: 'retain-on-failure'`. That option **records every test** and only deletes the video afterwards. Encoding 4 parallel videos on Windows took 25–56 s per test. Found by reading the trace timings (`Close context 25795ms`). | Wrong default in config |

### 1.4 Fixes applied by the AI
| # | Fix | Result |
|---|-----|--------|
| 1 | `HomePage.waitForProducts()` now matches on URL **path + request body**, not on method/URL params | 6 search tests green |
| 3 | Removed the `^ $` anchors from the regex | TC-SRCH-01 green |
| 4 | New `ProductPage.openAvailable(n)`: skips out-of-stock cards and asserts the button is enabled | TC-CART-06 green |
| 5 | `video: 'off'`, trace kept (it already contains a screencast) | Full run **3.0 min → 1.2 min**, no timeouts |

Final AI result: **26/26 passed**, and **52/52** in a stability run
(`--repeat-each=2 --retries=0`). Logs: `run4.txt`, `run5.txt`.

### 1.5 Observations about the AI's behaviour
- **Good:** it explored the live site *before* writing test cases. It noticed the
  account lockout on the shared demo user and designed the test data around it.
  It debugged with evidence (snapshots, traces, network logs) instead of adding
  sleeps or raising timeouts.
- **Bad:** it still made **unverified assumptions** (the API format), even though
  it had the tools to check them. Exploration in Stage 2 used fixed
  `waitForTimeout` calls, which hid the async behaviour that later broke the tests.
- **Bad:** one config default (video) chosen in Stage 1 later cost two failures
  and 2× run time. "It runs" on a 1-test smoke check did not mean "it scales".

---

## Part 2 — Review and improvement round

### 2.1 How this round was done
A suite that is 26/26 green is not automatically a good suite. A test can pass
while checking almost nothing. So after the green run I did a review round:

1. I read the generated code and docs.
2. I asked the AI for a **critical review of its own code** (AI-assisted code
   review). It listed 10 weak points and did **not** fix them, so that the
   decision stayed with me.
3. **I chose** what to fix: general clean-up + comments, and items **1, 2, 5, 6, 7**.
   Items 8, 9 and 10 were not taken in this round (see 2.3).
4. The AI implemented the chosen changes. The result was verified by a full
   run, twice, without retries: **52/52 passed** (log: `run6.txt`).

### 2.2 Changes made
| # | Where | Problem | Change | Why it matters |
|---|-------|---------|--------|----------------|
| 1 | TC-CHK-04, `CheckoutPage` | The test checked the guest button only with `toBeAttached()`, i.e. "exists in the HTML". On the live site the guest form is **hidden** behind a "Continue as Guest" tab. The test would pass even if the tab were broken. | The test now checks that the "Sign in" tab is open by default (guest form hidden), clicks "Continue as Guest" and checks that email, first name, last name and the submit button are **visible**. TestCases.md updated. | **A weak assertion = a false sense of safety.** The old test could not fail for the bug it was named after. |
| 2 | `HomePage.filterByCategory` (TC-SRCH-04) | Search and sort waited for *their* request (checked by body), but the category filter waited for **any** `/products` response. It could catch an unrelated request and read the grid too early. | The wait now requires `by_category` in the request body. `waitForProducts` reads the body as JSON (`postDataJSON`) instead of string matching. | Removes a hidden race condition: the test was green by timing luck, not by design. |
| 5 | `pages/RegisterPage.ts` → `models/User.ts` | A page object imported a type from `tests/helpers/`: the production-like layer depended on the test layer. | `User`/`Address` types and `fullName()` moved to a new `models/` folder. Pages and tests both import from there. | Clean dependencies: `models` ← `pages` ← `tests`. Page objects can be reused without the test folder. |
| 6 | `cart.spec.ts`, `checkout.spec.ts`, `price.ts` | Money was compared in 3 different ways: `toBeCloseTo`, cents, and the string `` `$${x.toFixed(2)}` ``. The string version breaks on `$1,014.15`. | One rule everywhere: `toCents(parsePrice(text))`. New `findPrice()` for prices inside a table row (invoice). CART-04 polls the parsed value, because totals update asynchronously. | One consistent, format-independent way to check money. |
| 7 | `fixtures.ts` → `loggedInUser` | Every checkout test logged in through the UI form (~5 s each). The login form is already covered by the Authentication suite. | Login via `POST /users/login`. The token is put into `localStorage["auth-token"]` with `context.addInitScript` before the app loads. Each test also checks that the header shows the user's name, so a broken token cannot go unnoticed. | Checkout tests: **23–27 s → 8–12 s** in a parallel run. Same coverage, fewer UI steps that can be flaky. |
| — | Clean-up | Dead code (`HomePage.openProduct`, `CheckoutPage.rowUnitPrice`, `openFirstAvailable` wrapper). An unused fixture variable `loggedInUser: _user` in 3 tests. | Dead code removed. `loggedInUser` is now actually used (passed to `goToPaymentStep`, which checks the user name). The duplicated payment steps were moved into `payWithCashOnDelivery()`. JSDoc comments added to every page object, fixture and helper, explaining *why* (e.g. why `QUERY`, why no shared accounts, why `.btn-danger`). | Easier to read and maintain. Comments keep the knowledge from the debugging sessions in the code. |

### 2.3 Items not taken in this round
| # | Item | Status |
|---|------|--------|
| 8 | Tests create users/orders on the public site and never delete them | Kept as a known trade-off. The public demo has no cleanup API for customers. The data is unique and harmless (`@example.com`). |
| 9 | `retries: 1` locally can hide flaky tests | Kept. The stability runs were done with `--retries=0 --repeat-each=2`. The HTML report marks retried tests as **flaky**, so they stay visible. |
| 10 | No CI (GitHub Actions) | Not in scope of this round. Possible next step after publishing the repository. |

### 2.4 Conclusion
- The AI was fast and produced a working, well-structured suite, but **green ≠
  correct**. Two of the problems fixed in this round (weak assertion in
  TC-CHK-04, unspecific wait in TC-SRCH-04) were invisible in the test results:
  they could only be found by reading the code against the real site.
- The AI's mistakes followed one pattern: **assumptions instead of checking**
  (API format, hidden form, video recording cost). Each was fixed by evidence
  from the live site: network log, page snapshot, trace timing.
- Final state: 26 tests, 5 suites, **52/52 passed** in the stability run,
  full run ≈ 1.4 min.
