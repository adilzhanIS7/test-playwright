import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

type SortOption = 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';

/**
 * Expected fields in the body of a products API request.
 * A string must match exactly; `true` means the field just has to be present
 * (used for category ids, which the test does not know in advance).
 */
type BodyMatch = Record<string, string | true>;

/** Home page = product catalog with search, category filters and sorting. */
export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchReset: Locator;
  /** "Searched for: <term>". Shown only while a search is active. */
  readonly searchCaption: Locator;
  /** "<N> products found for '<term>'" */
  readonly searchResultCount: Locator;
  readonly noResults: Locator;
  readonly sortSelect: Locator;
  /** Product cards (<a data-test="product-<id>">) in the grid. */
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchReset = page.getByTestId('search-reset');
    this.searchCaption = page.getByTestId('search-caption');
    this.searchResultCount = page.getByTestId('search-result-count');
    this.noResults = page.getByTestId('no-results');
    this.sortSelect = page.getByTestId('sort');
    this.productCards = page.locator('a[data-test^="product-"]');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
  }

  /** Opens the catalog and waits until the first products are rendered. */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.productNames.first().waitFor();
  }

  /**
   * Runs an action and waits for the products API call it triggers.
   * The grid re-renders asynchronously: reading it right after a click can
   * return the previous results.
   *
   * The app sends these calls with the HTTP `QUERY` method and puts the filters
   * in a JSON body, not in the URL. So the match is on URL path + body fields.
   */
  private async waitForProducts(
    action: () => Promise<unknown>,
    path: '/products' | '/products/search',
    expectedBody: BodyMatch = {},
  ): Promise<void> {
    const response = this.page.waitForResponse((r) => {
      if (new URL(r.url()).pathname !== path || !r.ok()) return false;
      const body = (r.request().postDataJSON() ?? {}) as Record<string, unknown>;
      return Object.entries(expectedBody).every(([key, value]) =>
        value === true ? key in body : body[key] === value,
      );
    });
    await action();
    await response;
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.waitForProducts(() => this.searchSubmit.click(), '/products/search', { q: term });
  }

  async resetSearch(): Promise<void> {
    await this.waitForProducts(() => this.searchReset.click(), '/products');
  }

  /** Ticks a category checkbox by its visible label, e.g. "Hammer". */
  async filterByCategory(name: string): Promise<void> {
    const checkbox = this.page.getByLabel(name, { exact: true });
    await this.waitForProducts(() => checkbox.check(), '/products', { by_category: true });
  }

  async sortBy(value: SortOption): Promise<void> {
    await this.waitForProducts(() => this.sortSelect.selectOption(value), '/products', { sort: value });
  }
}
