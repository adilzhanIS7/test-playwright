import { test, expect } from './helpers/fixtures';
import { uniqueEmail } from './helpers/users';
import { fullName } from '../models/User';

test.describe('Suite 1 — Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('TC-AUTH-01 Login with valid credentials', async ({ page, loginPage, freshUser }) => {
    await loginPage.login(freshUser.email, freshUser.password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(loginPage.userMenu).toHaveText(fullName(freshUser));
  });

  // Uses a fresh user, not a shared demo account: failed attempts lock the account.
  test('TC-AUTH-02 Login with wrong password', async ({ page, loginPage, freshUser }) => {
    await loginPage.login(freshUser.email, 'WrongPass#123');

    await expect(loginPage.loginError).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(loginPage.userMenu).toBeHidden();
  });

  test('TC-AUTH-03 Login with non-registered email', async ({ page, loginPage }) => {
    await loginPage.login(uniqueEmail('not.registered'), 'Whatever#123');

    // Same message as for a wrong password: the site does not reveal which emails exist.
    await expect(loginPage.loginError).toHaveText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('TC-AUTH-04 Login with empty fields', async ({ page, loginPage }) => {
    await loginPage.submit.click();

    await expect(loginPage.emailError).toHaveText('Email is required');
    await expect(loginPage.passwordError).toHaveText('Password is required');
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('TC-AUTH-05 Logout', async ({ page, loginPage, freshUser }) => {
    await loginPage.login(freshUser.email, freshUser.password);
    await expect(page).toHaveURL(/\/account$/);

    await loginPage.signOut();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(loginPage.signInLink).toBeVisible();
    await expect(loginPage.userMenu).toBeHidden();
  });
});
