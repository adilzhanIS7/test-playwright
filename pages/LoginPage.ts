import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /auth/login */
export class LoginPage extends BasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  /** Server-side error, e.g. "Invalid email or password". */
  readonly loginError: Locator;
  /** Client-side validation messages under the fields. */
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-submit');
    this.loginError = page.getByTestId('login-error');
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
