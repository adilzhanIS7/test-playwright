import { test, expect } from './helpers/fixtures';
import { parsePrice, toCents } from './helpers/price';

test.describe('Suite 4 — Product Details & Cart', () => {
  test('TC-CART-01 Open product details', async ({ page, homePage, productPage }) => {
    await homePage.goto();
    const card = homePage.productCards.first();
    const cardName = (await card.getByTestId('product-name').innerText()).trim();
    const cardPrice = parsePrice(await card.getByTestId('product-price').innerText());

    await card.click();

    await expect(page).toHaveURL(/\/product\/\w+/);
    await expect(productPage.name).toHaveText(cardName);
    expect(toCents(parsePrice(await productPage.unitPrice.innerText()))).toBe(toCents(cardPrice));
    await expect(productPage.description).not.toBeEmpty();
    await expect(productPage.quantity).toHaveValue('1');
    await expect(productPage.addToCartButton).toBeVisible();
  });

  test('TC-CART-02 Add product to cart', async ({ productPage }) => {
    await productPage.openAvailable();

    await productPage.addToCart();

    await expect(productPage.toast('Product added to shopping cart.')).toBeVisible();
    await expect(productPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-03 Add product with quantity 2', async ({ productPage, checkoutPage }) => {
    await productPage.openAvailable();
    const name = (await productPage.name.innerText()).trim();
    const unitPrice = parsePrice(await productPage.unitPrice.innerText());

    await productPage.increaseQuantity.click();
    await expect(productPage.quantity).toHaveValue('2');
    await productPage.addToCart();
    await expect(productPage.cartBadge).toHaveText('2');

    await checkoutPage.openCart();
    const row = checkoutPage.row(name);
    await expect(checkoutPage.rowQuantity(row)).toHaveValue('2');
    const linePrice = parsePrice(await checkoutPage.rowLinePrice(row).innerText());
    expect(toCents(linePrice)).toBe(toCents(unitPrice * 2));
  });

  test('TC-CART-04 Update quantity in cart', async ({ productPage, checkoutPage }) => {
    await productPage.openAvailable();
    const name = (await productPage.name.innerText()).trim();
    const unitPrice = parsePrice(await productPage.unitPrice.innerText());
    await productPage.addToCart();
    await expect(productPage.cartBadge).toHaveText('1');

    await checkoutPage.openCart();
    const row = checkoutPage.row(name);
    await checkoutPage.setQuantity(row, 3);

    await expect(checkoutPage.toast('Product quantity updated.')).toBeVisible();
    // Totals are recalculated asynchronously, so poll until they match.
    const expectedCents = toCents(unitPrice * 3);
    await expect
      .poll(async () => toCents(parsePrice(await checkoutPage.rowLinePrice(row).innerText())))
      .toBe(expectedCents);
    await expect
      .poll(async () => toCents(parsePrice(await checkoutPage.cartTotal.innerText())))
      .toBe(expectedCents);
  });

  test('TC-CART-05 Remove product from cart', async ({ productPage, checkoutPage }) => {
    await productPage.openAvailable();
    const name = (await productPage.name.innerText()).trim();
    await productPage.addToCart();
    await expect(productPage.cartBadge).toHaveText('1');

    await checkoutPage.openCart();
    await checkoutPage.rowDeleteButton(checkoutPage.row(name)).click();

    await expect(checkoutPage.emptyCartMessage).toBeVisible();
    await expect(checkoutPage.cartRows).toHaveCount(0);
  });

  test('TC-CART-06 Cart total for multiple products', async ({ productPage, checkoutPage }) => {
    for (const index of [0, 1]) {
      await productPage.openAvailable(index);
      await productPage.addToCart();
      await expect(productPage.cartBadge).toHaveText(String(index + 1));
    }

    await checkoutPage.openCart();
    await expect(checkoutPage.cartRows).toHaveCount(2);

    const lineTotals = (await checkoutPage.page.getByTestId('line-price').allInnerTexts()).map(parsePrice);
    const sumCents = lineTotals.reduce((sum, price) => sum + toCents(price), 0);
    expect(toCents(parsePrice(await checkoutPage.cartTotal.innerText()))).toBe(sumCents);
  });
});
