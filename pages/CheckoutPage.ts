import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * /checkout is a 4-step wizard: Cart -> Sign in -> Billing address -> Payment.
 * All steps are rendered on one URL. Step 1 (the cart) is also used by the cart tests.
 */
export class CheckoutPage extends BasePage {
  // Step 1: cart
  /** Table rows that contain a product (header and total rows excluded). */
  readonly cartRows: Locator;
  readonly cartTotal: Locator;
  readonly emptyCartMessage: Locator;
  readonly proceedFromCart: Locator;

  // Step 2: sign in. Two tabs: "Sign in" (default) and "Continue as Guest".
  readonly proceedFromSignIn: Locator;
  readonly loginEmail: Locator;
  readonly loginSubmit: Locator;
  readonly guestTab: Locator;
  readonly guestEmail: Locator;
  readonly guestFirstName: Locator;
  readonly guestLastName: Locator;
  readonly guestSubmit: Locator;

  // Step 3: billing address (pre-filled from the user profile)
  readonly street: Locator;
  readonly proceedFromAddress: Locator;

  // Step 4: payment. The same "finish" button is first "Check payment", then "Confirm".
  readonly paymentMethod: Locator;
  readonly finishButton: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('tr').filter({ has: page.getByTestId('product-title') });
    this.cartTotal = page.getByTestId('cart-total');
    this.emptyCartMessage = page.getByText('The cart is empty. Nothing to display.');
    this.proceedFromCart = page.getByTestId('proceed-1');

    this.proceedFromSignIn = page.getByTestId('proceed-2');
    this.loginEmail = page.getByTestId('email');
    this.loginSubmit = page.getByTestId('login-submit');
    // The tabs are plain <a> elements without data-test or href (so no "link" role):
    // matched by tag + exact text. The guest submit button has the same text, but it is an <input>.
    this.guestTab = page.locator('a').filter({ hasText: /^Continue as Guest$/ });
    this.guestEmail = page.getByTestId('guest-email');
    this.guestFirstName = page.getByTestId('guest-first-name');
    this.guestLastName = page.getByTestId('guest-last-name');
    this.guestSubmit = page.getByTestId('guest-submit');

    this.street = page.getByTestId('street');
    this.proceedFromAddress = page.getByTestId('proceed-3');

    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.getByText(/Thanks for your order! Your invoice number is INV-\d+/);
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  /** Cart row of a product, found by its name. */
  row(productName: string): Locator {
    return this.cartRows.filter({ hasText: productName });
  }

  rowQuantity(row: Locator): Locator {
    return row.getByTestId('product-quantity');
  }

  rowLinePrice(row: Locator): Locator {
    return row.getByTestId('line-price');
  }

  /** The red delete button has no data-test attribute, so the Bootstrap class is used. */
  rowDeleteButton(row: Locator): Locator {
    return row.locator('.btn-danger');
  }

  async setQuantity(row: Locator, quantity: number): Promise<void> {
    const input = this.rowQuantity(row);
    await input.fill(String(quantity));
    await input.press('Tab'); // the cart is updated on blur
  }

  /** Reads "INV-2026000024" from the confirmation message. */
  async invoiceNumber(): Promise<string> {
    const text = await this.orderConfirmation.innerText();
    const match = text.match(/INV-\d+/);
    if (!match) throw new Error(`No invoice number in "${text}"`);
    return match[0];
  }
}
