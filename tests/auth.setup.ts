import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '../src/fixtures/test';
import { AUTH_STATE } from '../src/config/auth';
import { env, hasTestUser } from '../src/config/env';
import { apiPaths } from '../src/config/routes';

setup('autenticar a conta de teste pela interface', async ({ page, loginPage }) => {
  fs.mkdirSync(path.dirname(AUTH_STATE), { recursive: true });

  if (!hasTestUser) {
    fs.writeFileSync(AUTH_STATE, JSON.stringify({ cookies: [], origins: [] }));
    setup.skip(true, 'TEST_USER_EMAIL/TEST_USER_PASSWORD não configurados — cenários logados serão pulados.');
  }

  await loginPage.goto();
  const loginResponse = page.waitForResponse(`${env.apiUrl}${apiPaths.login}`);
  await loginPage.login(env.testUser.email, env.testUser.password);

  expect((await loginResponse).status(), 'login recusado pela API').toBe(200);

  await expect(page).toHaveURL(new URL('/', env.baseUrl).href);
  await expect(page.locator('#user-menu-trigger')).toBeVisible();
  const token = await page.evaluate(() => localStorage.getItem('authToken'));
  expect(token, 'token não foi persistido no localStorage').toBeTruthy();

  await page.context().storageState({ path: AUTH_STATE });
});
