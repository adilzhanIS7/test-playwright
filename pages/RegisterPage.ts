import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { User } from '../models/User';

/** /auth/register */
export class RegisterPage extends BasePage {
  readonly submit: Locator;
  /** Server-side error, e.g. "A customer with this email address already exists." */
  readonly registerError: Locator;

  constructor(page: Page) {
    super(page);
    this.submit = page.getByTestId('register-submit');
    this.registerError = page.getByTestId('register-error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
  }

  /** Form field by its data-test name, e.g. field('first-name'). */
  field(name: string): Locator {
    return this.page.getByTestId(name);
  }

  /** Validation message under a field: fieldError('email') -> [data-test="email-error"]. */
  fieldError(name: string): Locator {
    return this.page.getByTestId(`${name}-error`);
  }

  async fillForm(user: User): Promise<void> {
    await this.field('first-name').fill(user.first_name);
    await this.field('last-name').fill(user.last_name);
    await this.field('dob').fill(user.dob);
    await this.field('country').selectOption(user.address.country);
    await this.field('postal_code').fill(user.address.postal_code);
    await this.field('house_number').fill(user.address.house_number);
    await this.field('street').fill(user.address.street);
    await this.field('city').fill(user.address.city);
    await this.field('state').fill(user.address.state);
    await this.field('phone').fill(user.phone);
    await this.field('email').fill(user.email);
    await this.field('password').fill(user.password);
  }

  async register(user: User): Promise<void> {
    await this.fillForm(user);
    await this.submit.click();
  }
}
