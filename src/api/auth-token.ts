import fs from 'node:fs';
import { AUTH_STATE } from '../config/auth';

type StorageState = {
  origins: Array<{ origin: string; localStorage: Array<{ name: string; value: string }> }>;
};

/** Reaproveita o token salvo pelo setup de login em vez de logar de novo. */
export function readAuthToken(): string | null {
  if (!fs.existsSync(AUTH_STATE)) return null;
  const state = JSON.parse(fs.readFileSync(AUTH_STATE, 'utf8')) as StorageState;
  for (const origin of state.origins) {
    const token = origin.localStorage.find((item) => item.name === 'authToken');
    if (token) return token.value;
  }
  return null;
}
