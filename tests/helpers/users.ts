import { User } from '../../models/User';

/** Meets the site's password rules (min 6 chars, letters + digits + symbols). */
export const DEFAULT_PASSWORD = 'Str0ng!Pass#2026';

/** Random lowercase letters. Names on the site must not contain digits. */
function letters(length: number): string {
  let out = '';
  while (out.length < length) {
    out += Math.random().toString(36).replace(/[^a-z]/g, '');
  }
  return out.slice(0, length);
}

/**
 * Unique email for every call: timestamp + random letters, so parallel
 * workers that start in the same millisecond still get different emails.
 */
export function uniqueEmail(prefix = 'qa.week6'): string {
  return `${prefix}.${Date.now()}.${letters(5)}@example.com`;
}

/** Builds a valid, unique customer. Pass overrides to change any field. */
export function buildUser(overrides: Partial<User> = {}): User {
  const suffix = letters(4);
  return {
    first_name: 'Aida',
    last_name: `Tester${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`,
    dob: '1995-05-15',
    phone: '77011234567',
    email: uniqueEmail(),
    password: DEFAULT_PASSWORD,
    address: {
      street: 'Abay Avenue',
      house_number: '10',
      city: 'Almaty',
      state: 'Almaty',
      country: 'KZ',
      postal_code: '050000',
    },
    ...overrides,
  };
}
