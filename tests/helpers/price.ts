/**
 * All money checks in the tests go through these two helpers:
 *   expect(toCents(parsePrice(text))).toBe(toCents(expected))
 * Comparing whole cents avoids floating point noise (0.1 + 0.2 !== 0.3)
 * and does not depend on how the UI formats the number.
 */

/** "$1,014.15" or " 14.15 " -> 1014.15 */
export function parsePrice(text: string): number {
  const value = Number(text.replace(/[^0-9.]/g, ''));
  if (text.trim() === '' || Number.isNaN(value)) {
    throw new Error(`Cannot parse price from "${text}"`);
  }
  return value;
}

/** 14.15 -> 1415 */
export const toCents = (value: number): number => Math.round(value * 100);

/** Finds the first "$12.34"-style amount inside a longer text, e.g. a table row. */
export function findPrice(text: string): number {
  const match = text.match(/\$\s?[\d,]+(\.\d{2})?/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return parsePrice(match[0]);
}
