# Prompt

## AI tool used
| Item | Value |
|------|-------|
| Tool | **Claude Code** — Anthropic's agentic coding CLI, running in a terminal (Windows 11, PowerShell / Git Bash) |
| Model | **Claude Opus 5.5** (`claude-opus-5-5`) |
| Mode | Agent mode with tool access (file read/write, shell commands), auto mode on |
| Context given to the model | The project folder (`playwright.config.ts`, `docs/Description.md`, `docs/TestCases.md`) and network access to the live site |
| Date | 2026-10-22 |

The model was allowed to read files, write code and run `npx playwright test`
in the project folder.

**How the prompt was used:** the main prompt below was written and saved in
this file first (Stage 3). Stage 4 was then started with the short message
«понятно, давай этап 4» ("ok, let's do stage 4"), and the model executed the
saved prompt **as written, without changes**.

---

## Main prompt — test generation

```text
You are a senior QA automation engineer. Generate a Playwright Test + TypeScript
E2E test suite for the demo shop https://practicesoftwaretesting.com
(Toolshop v5.0, Angular SPA, REST API at https://api.practicesoftwaretesting.com).

CONTEXT
- The project is already set up: see playwright.config.ts
  (baseURL is set, testIdAttribute = 'data-test', Chromium only).
- Read docs/TestCases.md — it contains 26 test cases in 5 suites.
  Automate ALL of them, keep the TC IDs in the test titles,
  e.g. test('TC-AUTH-01 Login with valid credentials', ...).
- Read docs/Description.md, section "Findings from manual exploration" —
  it lists real messages, URLs and behaviour of the site. Use it.

STRUCTURE
- Page Object Model in pages/: BasePage (header, cart badge, user menu, toasts),
  LoginPage, RegisterPage, HomePage (search, filters, sort, product grid),
  ProductPage, CartPage / CheckoutPage.
- One spec file per suite in tests/: auth.spec.ts, register.spec.ts,
  search.spec.ts, cart.spec.ts, checkout.spec.ts.
- Test data and helpers in tests/helpers/ (or tests/fixtures/):
  a user factory that builds unique users, and an API helper.
- Use a custom Playwright fixture (test.extend) to provide page objects
  and a freshly registered user, so tests stay short and readable.

RULES
1. Locators: use page.getByTestId() (data-test attribute) first.
   Use getByRole/getByText only when no data-test exists.
   No XPath, no long CSS chains.
2. NEVER use the shared demo accounts (customer@practicesoftwaretesting.com etc.):
   they get locked after failed logins. Every test that needs an account must
   register a NEW unique user through POST /users/register with Playwright's
   `request` API.
3. No page.waitForTimeout(). Use web-first assertions
   (toHaveURL, toHaveText, toBeVisible, toHaveCount) and, where the UI
   updates asynchronously (search, filters, sort), wait for the matching
   API response before reading the product grid.
4. Each test must be independent and able to run in parallel and in any order.
5. Assert on business outcomes (messages, URLs, prices, counts), not just
   "element is visible". For prices, parse "$14.15" into numbers and compare
   with a tolerance of 0.01.
6. Use test.describe per suite and test.step for multi-step flows (checkout).
7. TypeScript must compile in strict mode (npx tsc --noEmit).

DELIVERABLE
- Write all files to the project.
- Run `npx tsc --noEmit` and `npx playwright test`, fix failing tests
  until the suite is green. If a test fails because the site behaves
  differently from TestCases.md, do NOT hide it: tell me which TC
  and what the actual behaviour is.
- At the end, give me a short summary: files created, number of tests,
  pass/fail result, and any assumptions you made.
```

---

## Supporting prompts (earlier in the same session)
These shorter prompts were used before the main prompt to plan the work and
prepare the project. They are given verbatim (originally in Russian, with an
English translation).

**1. Planning**
> *(The assignment text was pasted)* + «нужно сделать все по вот этим правилам, давай начнем по этапно, сделай план»
>
> EN: "I need to do everything according to these rules, let's go step by step, make a plan."

**2. Project setup (Stage 1)**
> «сьюты подходят, документы на английском, начинай этап 1»
>
> EN: "The suites are fine, documents in English, start stage 1."
>
> Result: Playwright config, tsconfig, folder structure, README, smoke test.

**3. Site exploration + test case design (Stage 2)**
> «да, начинай этап 2»
>
> EN: "Yes, start stage 2."
>
> Result: the AI explored the live site with throw-away Playwright scripts,
> wrote `Description.md` and `TestCases.md`.

## Follow-up prompts (after the main prompt)

**4. Review (Stage 5)**
> «да давай, в целом я все прочитал, и ты что то не оставил мне ничего что можно было бы исправить...»
>
> EN: "Yes, go. I have read everything, and you didn't leave me anything that could be fixed..."
>
> Result: the AI wrote Part 1 of `Review.md` and listed 10 weak points of its
> own code. It did not fix them, so the reviewer could choose.

**5. Improvements chosen by me**
> «сделай чистку кода, добавь комментарии и исправь 1, 2, 5, 6, 7»
>
> EN: "Clean up the code, add comments and fix items 1, 2, 5, 6, 7."
>
> Result: see `Review.md`, Part 2.
