import { test, expect } from './helpers/fixtures';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ProductPage } from '../pages/ProductPage';
import { fullName, User } from '../models/User';
import { findPrice, parsePrice, toCents } from './helpers/price';

/**
 * Shared setup for the logged-in checkout tests: adds the first in-stock product
 * to the cart and walks the wizard up to the payment step.
 * Returns the product price for later checks.
 */
async function goToPaymentStep(
  user: User,
  productPage: ProductPage,
  checkoutPage: CheckoutPage,
): Promise<number> {
  await productPage.openAvailable();
  // The session comes from the injected API token; make sure it really works.
  await expect(productPage.userMenu).toHaveText(fullName(user));
  const price = parsePrice(await productPage.unitPrice.innerText());
  await productPage.addToCart();
  await expect(productPage.cartBadge).toHaveText('1');

  await checkoutPage.openCart();
  await checkoutPage.proceedFromCart.click();
  await checkoutPage.proceedFromSignIn.click(); // already logged in, so just "Proceed"
  await expect(checkoutPage.street).not.toHaveValue(''); // pre-filled from the profile
  await checkoutPage.proceedFromAddress.click();
  await expect(checkoutPage.paymentMethod).toBeVisible();
  return price;
}

/** Two clicks on the same button: "Check payment", then "Confirm". */
async function payWithCashOnDelivery(checkoutPage: CheckoutPage): Promise<void> {
  await checkoutPage.paymentMethod.selectOption('cash-on-delivery');
  await checkoutPage.finishButton.click();
  await expect(checkoutPage.paymentSuccess).toHaveText('Payment was successful');
  await checkoutPage.finishButton.click();
  await expect(checkoutPage.orderConfirmation).toBeVisible();
}

test.describe('Suite 5 — Checkout', () => {
  test('TC-CHK-01 Complete checkout as a logged-in user (Cash on Delivery)', async ({
    loggedInUser,
    productPage,
    checkoutPage,
  }) => {
    await test.step('Add product and go to payment', async () => {
      await goToPaymentStep(loggedInUser, productPage, checkoutPage);
    });

    await test.step('Check payment', async () => {
      await checkoutPage.paymentMethod.selectOption('cash-on-delivery');
      await checkoutPage.finishButton.click();
      await expect(checkoutPage.paymentSuccess).toHaveText('Payment was successful');
    });

    await test.step('Confirm order', async () => {
      await checkoutPage.finishButton.click();
      await expect(checkoutPage.orderConfirmation).toBeVisible();
      expect(await checkoutPage.invoiceNumber()).toMatch(/^INV-\d+$/);
    });
  });

  test('TC-CHK-02 Order appears in "My invoices"', async ({
    loggedInUser,
    productPage,
    checkoutPage,
    invoicesPage,
  }) => {
    const price = await goToPaymentStep(loggedInUser, productPage, checkoutPage);
    await payWithCashOnDelivery(checkoutPage);
    const invoice = await checkoutPage.invoiceNumber();

    await invoicesPage.goto();

    const row = invoicesPage.invoiceRow(invoice);
    await expect(row).toBeVisible();
    expect(toCents(findPrice(await row.innerText()))).toBe(toCents(price));
  });

  test('TC-CHK-03 Payment cannot be submitted without a payment method', async ({
    loggedInUser,
    productPage,
    checkoutPage,
  }) => {
    await goToPaymentStep(loggedInUser, productPage, checkoutPage);

    await expect(checkoutPage.paymentMethod).toHaveValue('');
    await expect(checkoutPage.finishButton).toBeDisabled();
  });

  test('TC-CHK-04 Anonymous user is asked to sign in or continue as guest', async ({ productPage, checkoutPage }) => {
    await productPage.openAvailable();
    await productPage.addToCart();
    await expect(productPage.cartBadge).toHaveText('1');

    await checkoutPage.openCart();
    await checkoutPage.proceedFromCart.click();

    await test.step('"Sign in" tab is open by default', async () => {
      await expect(checkoutPage.loginEmail).toBeVisible();
      await expect(checkoutPage.loginSubmit).toBeVisible();
      await expect(checkoutPage.guestEmail).toBeHidden();
    });

    await test.step('"Continue as Guest" tab shows the guest form', async () => {
      await checkoutPage.guestTab.click();
      await expect(checkoutPage.guestEmail).toBeVisible();
      await expect(checkoutPage.guestFirstName).toBeVisible();
      await expect(checkoutPage.guestLastName).toBeVisible();
      await expect(checkoutPage.guestSubmit).toBeVisible();
    });
  });
});
