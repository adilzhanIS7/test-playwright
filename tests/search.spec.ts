import { test, expect } from './helpers/fixtures';
import { parsePrice } from './helpers/price';

test.describe('Suite 3 — Product Search & Filter', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('TC-SRCH-01 Search by keyword', async ({ homePage }) => {
    await homePage.search('pliers');

    await expect(homePage.searchCaption).toHaveText('Searched for: pliers');
    await expect(homePage.searchResultCount).toHaveText(/\b[1-9]\d* products? found for 'pliers'/);

    const names = await homePage.productNames.allInnerTexts();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.toLowerCase()).toContain('pliers');
    }
  });

  test('TC-SRCH-02 Search with no results', async ({ homePage }) => {
    await homePage.search('zzznotexist');

    await expect(homePage.noResults).toHaveText('There are no products found.');
    await expect(homePage.searchResultCount).toHaveText("0 products found for 'zzznotexist'");
    await expect(homePage.productNames).toHaveCount(0);
  });

  test('TC-SRCH-03 Reset search', async ({ homePage }) => {
    await homePage.search('pliers');
    await expect(homePage.searchCaption).toBeVisible();
    const searchCount = await homePage.productNames.count();

    await homePage.resetSearch();

    await expect(homePage.searchCaption).toBeHidden();
    await expect(homePage.searchInput).toHaveValue('');
    await expect.poll(() => homePage.productNames.count()).toBeGreaterThan(searchCount);
  });

  test('TC-SRCH-04 Filter by category', async ({ homePage }) => {
    await homePage.filterByCategory('Hammer');

    await expect
      .poll(async () => {
        const names = await homePage.productNames.allInnerTexts();
        return names.length > 0 && names.every((n) => n.toLowerCase().includes('hammer'));
      }, { message: 'every product in the grid should be a hammer' })
      .toBe(true);
  });

  test('TC-SRCH-05 Sort by price Low → High', async ({ homePage }) => {
    await homePage.sortBy('price,asc');

    await expect
      .poll(async () => {
        const prices = (await homePage.productPrices.allInnerTexts()).map(parsePrice);
        return prices.length > 1 && prices.every((p, i) => i === 0 || prices[i - 1] <= p);
      }, { message: 'prices should be in ascending order' })
      .toBe(true);
  });

  test('TC-SRCH-06 Sort by name A → Z', async ({ homePage }) => {
    // Sort Z→A first so the check proves the A→Z sort really changed the order.
    await homePage.sortBy('name,desc');
    await homePage.sortBy('name,asc');

    await expect
      .poll(async () => {
        const names = await homePage.productNames.allInnerTexts();
        const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
        return names.length > 1 && names.join('|') === sorted.join('|');
      }, { message: 'names should be in alphabetical order' })
      .toBe(true);
  });
});
