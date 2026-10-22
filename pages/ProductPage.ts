import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /product/<id> */
export class ProductPage extends BasePage {
  readonly name: Locator;
  /** Price without the "$" sign, e.g. "14.15". */
  readonly unitPrice: Locator;
  readonly description: Locator;
  readonly quantity: Locator;
  readonly increaseQuantity: Locator;
  readonly decreaseQuantity: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.quantity = page.getByTestId('quantity');
    this.increaseQuantity = page.getByTestId('increase-quantity');
    this.decreaseQuantity = page.getByTestId('decrease-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
  }

  /**
   * Opens the n-th (0-based) in-stock product from the home page.
   * Out-of-stock products have a disabled "Add to cart" button, so they are skipped.
   * No product ids are hard-coded: the catalog of the public demo can change.
   */
  async openAvailable(index = 0): Promise<void> {
    await this.page.goto('/');
    const card = this.page
      .locator('a[data-test^="product-"]')
      .filter({ hasNot: this.page.getByTestId('out-of-stock') })
      .nth(index);
    await card.click();
    await this.name.waitFor();
    await expect(this.addToCartButton).toBeEnabled();
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
