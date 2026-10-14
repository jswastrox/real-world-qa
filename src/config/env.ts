import 'dotenv/config';

function optional(name: string, fallback = ''): string {
  return (process.env[name] ?? fallback).trim();
}

export const env = {
  baseUrl: optional('BASE_URL', 'https://placaveicular.online'),
  apiUrl: optional('API_URL', 'https://api.apiveicular.online'),
  testUser: {
    name: optional('TEST_USER_NAME', 'qa_portfolio'),
    email: optional('TEST_USER_EMAIL'),
    password: optional('TEST_USER_PASSWORD'),
  },
  isCI: Boolean(process.env.CI),
};

export const hasTestUser = Boolean(env.testUser.email && env.testUser.password);
