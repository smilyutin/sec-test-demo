import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SearchPage } from '../pages/SearchPage';
import { AdminPage } from '../pages/AdminPage';
import { RegistrationPage } from '../pages/RegistrationPage';

interface E2EFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  searchPage: SearchPage;
  adminPage: AdminPage;
  registrationPage: RegistrationPage;

  /**
   * When enabled (default), each test starts by navigating to '/'.
   * Disable via: test.use({ autoGoto: false }) in a describe/test.
   */
  autoGoto: boolean;
  /** Internal auto-fixture that performs the navigation. */
  gotoHome: void;
}

export const test = base.extend<E2EFixtures>({
  autoGoto: [true, { option: true }],

  gotoHome: [
    async ({ page, autoGoto }, use) => {
      if (autoGoto) {
        const response = await page.goto('/');
        expect(response?.status()).toBe(200);
        await expect(page.getByRole('heading', { name: 'Security Testing Demo' })).toBeVisible();
      }

      await use(undefined);
    },
    { auto: true }
  ],

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  searchPage: async ({ page }, use) => {
    const searchPage = new SearchPage(page);
    await use(searchPage);
  },

  adminPage: async ({ page }, use) => {
    const adminPage = new AdminPage(page);
    await use(adminPage);
  },

  registrationPage: async ({ page }, use) => {
    const registrationPage = new RegistrationPage(page);
    await use(registrationPage);
  }
});

export { expect };