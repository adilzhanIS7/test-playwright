# Test Cases to be Automated

**Application:** https://practicesoftwaretesting.com (Toolshop v5.0)
**Total:** 26 test cases in 5 suites
**Priority:** High = core business flow, Medium = important validation, Low = nice to have

**Common precondition "Fresh user":** a new unique customer is created via
`POST https://api.practicesoftwaretesting.com/users/register`
(email `qa.week6.<timestamp>@example.com`, password `Str0ng!Pass#2026`).

---

## Suite 1 — Authentication (`tests/auth.spec.ts`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-AUTH-01 | Login with valid credentials | Fresh user | 1. Open `/auth/login` 2. Enter valid email and password 3. Click **Login** | Redirect to `/account`; heading "My account" is visible; user menu shows "First Last" name | High |
| TC-AUTH-02 | Login with wrong password | Fresh user | 1. Open `/auth/login` 2. Enter valid email + wrong password 3. Click **Login** | Error "Invalid email or password" is shown; user stays on `/auth/login` | High |
| TC-AUTH-03 | Login with non-registered email | — | 1. Open `/auth/login` 2. Enter unknown email + any password 3. Click **Login** | Error "Invalid email or password" is shown | Medium |
| TC-AUTH-04 | Login with empty fields | — | 1. Open `/auth/login` 2. Click **Login** without filling the form | "Email is required" and "Password is required" errors are shown | Medium |
| TC-AUTH-05 | Logout | Fresh user, logged in | 1. Open user menu 2. Click **Sign out** | Redirect to `/auth/login`; "Sign in" link is visible in the header | High |

## Suite 2 — Registration (`tests/register.spec.ts`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-REG-01 | Register a new customer with valid data | Unique email | 1. Open `/auth/register` 2. Fill all fields with valid data (country = Kazakhstan) 3. Click **Register** 4. Log in with the new credentials | After step 3 redirect to `/auth/login`; after step 4 user lands on `/account` | High |
| TC-REG-02 | Submit empty registration form | — | 1. Open `/auth/register` 2. Click **Register** | Required-field errors shown for first name, last name, DOB, country, postcode, house number, street, city, state, phone, email, password | Medium |
| TC-REG-03 | Register with an already used email | Fresh user (email already exists) | 1. Fill the form with the existing user's email 2. Click **Register** | Error "A customer with this email address already exists."; stays on `/auth/register` | High |
| TC-REG-04 | Invalid email format | — | 1. Enter `not-an-email` into email 2. Click **Register** | Error "Email format is invalid" | Medium |
| TC-REG-05 | Password shorter than 6 characters | — | 1. Enter `123` into password 2. Click **Register** | Error "Password must be minimal 6 characters long." | Medium |

## Suite 3 — Product Search & Filter (`tests/search.spec.ts`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-SRCH-01 | Search by keyword | — | 1. Open home page 2. Type `pliers` 3. Click **Search** | Caption "Searched for: pliers"; result count text "N products found for 'pliers'" (N > 0); every product name contains "Pliers" | High |
| TC-SRCH-02 | Search with no results | — | 1. Search for `zzznotexist` | "There are no products found." is shown; count is 0 | Medium |
| TC-SRCH-03 | Reset search | A search was performed | 1. Search for `pliers` 2. Click **X** (reset) | Search caption disappears; full catalog is shown again (more products than in the search result) | Low |
| TC-SRCH-04 | Filter by category | — | 1. Open home page 2. Tick category **Hammer** | Every product name in the grid contains "Hammer" | High |
| TC-SRCH-05 | Sort by price Low → High | — | 1. Select sort "Price (Low - High)" | Prices on the page are in ascending order | Medium |
| TC-SRCH-06 | Sort by name A → Z | — | 1. Select sort "Name (A - Z)" | Product names on the page are in alphabetical order | Medium |

## Suite 4 — Product Details & Cart (`tests/cart.spec.ts`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-CART-01 | Open product details | — | 1. Open home page 2. Click the first product card | Product page shows the same name and price as the card, a description, quantity input = 1 and **Add to cart** button | High |
| TC-CART-02 | Add product to cart | — | 1. Open a product page 2. Click **Add to cart** | Toast "Product added to shopping cart."; cart badge in header = 1 | High |
| TC-CART-03 | Add product with quantity 2 | — | 1. Open a product page 2. Click **+** once (quantity = 2) 3. Add to cart 4. Open cart | Badge = 2; cart line quantity = 2; line price = 2 × unit price | Medium |
| TC-CART-04 | Update quantity in cart | 1 product in cart | 1. Open cart 2. Change quantity to 3 | Toast "Product quantity updated."; line total and cart total = 3 × unit price | High |
| TC-CART-05 | Remove product from cart | 1 product in cart | 1. Open cart 2. Click the delete (red) button | Message "The cart is empty. Nothing to display." | High |
| TC-CART-06 | Cart total for multiple products | — | 1. Add two different products 2. Open cart | Cart contains 2 lines; cart total = sum of line prices | Medium |

## Suite 5 — Checkout (`tests/checkout.spec.ts`)

| ID | Title | Preconditions | Steps | Expected result | Priority |
|----|-------|---------------|-------|-----------------|----------|
| TC-CHK-01 | Complete checkout as a logged-in user (Cash on Delivery) | Fresh user, logged in, 1 product in cart | 1. Open cart → **Proceed to checkout** 2. Sign-in step → **Proceed** 3. Billing address (pre-filled) → **Proceed** 4. Select "Cash on Delivery" → **Check payment** 5. **Confirm** | After step 4: "Payment was successful"; after step 5: "Thanks for your order! Your invoice number is INV-…" | High |
| TC-CHK-02 | Order appears in "My invoices" | TC-CHK-01 flow completed | 1. Complete an order 2. Open `/account/invoices` | Invoice with the same number and total is listed | High |
| TC-CHK-03 | Payment cannot be submitted without a payment method | Fresh user at payment step | 1. Reach payment step 2. Do not select a method | **Check payment** button is disabled | Medium |
| TC-CHK-04 | Anonymous user is asked to sign in or continue as guest | Not logged in, 1 product in cart | 1. Open cart → **Proceed to checkout** 2. Click the **Continue as Guest** tab | After step 1: the "Sign in" tab is open (login form visible, guest form hidden). After step 2: guest email, first name, last name and **Continue as Guest** button are visible | Medium |

---

## Traceability summary
| Suite | TCs | High | Medium | Low |
|-------|-----|------|--------|-----|
| Authentication | 5 | 3 | 2 | 0 |
| Registration | 5 | 2 | 3 | 0 |
| Search & Filter | 6 | 2 | 3 | 1 |
| Details & Cart | 6 | 4 | 2 | 0 |
| Checkout | 4 | 2 | 2 | 0 |
| **Total** | **26** | **13** | **12** | **1** |
