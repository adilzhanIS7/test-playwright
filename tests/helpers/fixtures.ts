import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { HomePage } from '../../pages/HomePage';
import { ProductPage } from '../../pages/ProductPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { InvoicesPage } from '../../pages/InvoicesPage';
import { User } from '../../models/User';
import { buildUser } from './users';
import { loginViaApi, registerUserViaApi } from './api';

/** Key under which the Angular app keeps the JWT (checked on the live site). */
const AUTH_STORAGE_KEY = 'auth-token';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  homePage: HomePage;
  productPage: ProductPage;
  checkoutPage: CheckoutPage;
  invoicesPage: InvoicesPage;
  /** A new customer registered via API. The browser is NOT logged in. */
  freshUser: User;
  /** A new customer whose API token is already in the browser: every page opens logged in. */
  loggedInUser: User;
};

/**
 * Custom `test` with page objects and test users.
 * Tests ask only for what they need, e.g. `async ({ loginPage, freshUser }) => ...`.
 * Playwright creates fixtures lazily, so an unused fixture costs nothing.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  invoicesPage: async ({ page }, use) => use(new InvoicesPage(page)),

  // Never use the shared demo accounts: they get locked after failed logins
  // by anyone on the internet. Each test gets its own new user instead.
  freshUser: async ({ request }, use) => {
    const user = buildUser();
    await registerUserViaApi(request, user);
    await use(user);
  },

  // Logs in through the API instead of the login form. The UI login is already
  // covered by the Authentication suite, and repeating it here only adds time
  // (~5 s per test). The token is injected before any page script runs.
  loggedInUser: async ({ freshUser, request, context }, use) => {
    const token = await loginViaApi(request, freshUser);
    await context.addInitScript(
      ({ key, value }) => {
        // Init scripts run on every origin, so write only on the shop's own pages.
        if (window.location.hostname.endsWith('practicesoftwaretesting.com')) {
          window.localStorage.setItem(key, value);
        }
      },
      { key: AUTH_STORAGE_KEY, value: token },
    );
    await use(freshUser);
  },
});

export { expect };
