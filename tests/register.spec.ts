import { test, expect } from './helpers/fixtures';
import { buildUser } from './helpers/users';

test.describe('Suite 2 — Registration', () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test('TC-REG-01 Register a new customer with valid data', async ({ page, registerPage, loginPage }) => {
    const user = buildUser();

    await registerPage.register(user);
    await expect(page).toHaveURL(/\/auth\/login$/);

    // The new account must actually work.
    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/account$/);
  });

  test('TC-REG-02 Submit empty registration form', async ({ page, registerPage }) => {
    await registerPage.submit.click();

    const expectedErrors: Record<string, string | RegExp> = {
      'first-name': 'First name is required',
      'last-name': 'Last name is required',
      dob: /Please enter a valid date/,
      country: 'Country is required',
      postal_code: 'Postcode is required',
      house_number: 'House number is required',
      street: 'Street is required',
      city: 'City is required',
      state: 'State is required',
      phone: 'Phone is required.',
      email: 'Email is required',
      password: /Password is required/,
    };
    for (const [field, message] of Object.entries(expectedErrors)) {
      await expect.soft(registerPage.fieldError(field), `error for "${field}"`).toContainText(message);
    }
    await expect(page).toHaveURL(/\/auth\/register$/);
  });

  test('TC-REG-03 Register with an already used email', async ({ page, registerPage, freshUser }) => {
    await registerPage.register(buildUser({ email: freshUser.email }));

    await expect(registerPage.registerError).toHaveText('A customer with this email address already exists.');
    await expect(page).toHaveURL(/\/auth\/register$/);
  });

  test('TC-REG-04 Invalid email format', async ({ registerPage }) => {
    await registerPage.field('email').fill('not-an-email');
    await registerPage.submit.click();

    await expect(registerPage.fieldError('email')).toHaveText('Email format is invalid');
  });

  test('TC-REG-05 Password shorter than 6 characters', async ({ registerPage }) => {
    await registerPage.field('password').fill('123');
    await registerPage.submit.click();

    await expect(registerPage.fieldError('password')).toContainText('Password must be minimal 6 characters long.');
  });
});
