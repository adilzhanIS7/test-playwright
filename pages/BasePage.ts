import { Locator, Page } from '@playwright/test';

/**
 * Parent of all page objects. Holds the elements that exist on every page:
 * the header (sign in, user menu, cart badge) and toast notifications.
 */
export class BasePage {
  readonly signInLink: Locator;
  /** Header button with the user's full name. Visible only when logged in. */
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  readonly cartLink: Locator;
  /** Number on the cart icon. Not rendered while the cart is empty. */
  readonly cartBadge: Locator;

  constructor(readonly page: Page) {
    this.signInLink = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartBadge = page.getByTestId('cart-quantity');
  }

  /** Toast notification with the given text, e.g. "Product added to shopping cart." */
  toast(text: string | RegExp): Locator {
    return this.page.getByRole('alert').filter({ hasText: text }).first();
  }

  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.signOutLink.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
