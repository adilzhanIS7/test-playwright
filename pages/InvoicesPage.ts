import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /account/invoices: the order history of the logged-in user. */
export class InvoicesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/account/invoices');
  }

  /** Table row of an invoice. Columns: number, billing address, date, total. */
  invoiceRow(invoiceNumber: string): Locator {
    return this.page.locator('table tbody tr').filter({ hasText: invoiceNumber });
  }
}
