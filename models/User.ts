/**
 * Domain model of a Toolshop customer.
 * Field names match the REST API (POST /users/register), so the same object
 * can be sent to the API and typed into the UI registration form.
 *
 * Lives outside tests/ so that page objects can use it without depending
 * on the test folder.
 */
export interface Address {
  street: string;
  house_number: string;
  city: string;
  state: string;
  /** ISO 3166 code used by the country <select>, e.g. "KZ". */
  country: string;
  postal_code: string;
}

export interface User {
  first_name: string;
  last_name: string;
  /** Format YYYY-MM-DD (required by the API and the date input). */
  dob: string;
  phone: string;
  email: string;
  password: string;
  address: Address;
}

/** Name shown in the header user menu after login. */
export const fullName = (user: User): string => `${user.first_name} ${user.last_name}`;
