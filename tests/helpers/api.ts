import { APIRequestContext, expect } from '@playwright/test';
import { User } from '../../models/User';

/** Backend of the shop. The UI baseURL in the config points to the frontend only. */
export const API_URL = 'https://api.practicesoftwaretesting.com';

/** Creates a customer through the REST API. Used for test data setup. */
export async function registerUserViaApi(request: APIRequestContext, user: User): Promise<void> {
  const response = await request.post(`${API_URL}/users/register`, { data: user });
  // The response body goes into the message, so a failed setup explains itself in the report.
  expect(response.status(), `register ${user.email}: ${await response.text()}`).toBe(201);
}

/** Logs in through the REST API and returns the JWT access token. */
export async function loginViaApi(request: APIRequestContext, user: User): Promise<string> {
  const response = await request.post(`${API_URL}/users/login`, {
    data: { email: user.email, password: user.password },
  });
  expect(response.status(), `login ${user.email}: ${await response.text()}`).toBe(200);
  const body = (await response.json()) as { access_token: string };
  return body.access_token;
}
