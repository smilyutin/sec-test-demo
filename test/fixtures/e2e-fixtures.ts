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
}

export const test = base.extend<E2EFixtures>({
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