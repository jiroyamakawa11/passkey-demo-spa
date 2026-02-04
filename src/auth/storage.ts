import type { StoredTokens } from "./types";

const STORAGE_KEYS = {
  state: "auth_state",
  nonce: "auth_nonce",
  codeVerifier: "pkce_verifier",
  tokens: "auth_tokens",
} as const;

export const saveAuthRequest = (state: string, nonce: string, codeVerifier: string) => {
  sessionStorage.setItem(STORAGE_KEYS.state, state);
  sessionStorage.setItem(STORAGE_KEYS.nonce, nonce);
  sessionStorage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);
};

export const loadAuthRequest = () => ({
  state: sessionStorage.getItem(STORAGE_KEYS.state),
  nonce: sessionStorage.getItem(STORAGE_KEYS.nonce),
  codeVerifier: sessionStorage.getItem(STORAGE_KEYS.codeVerifier),
});

export const clearAuthRequest = () => {
  sessionStorage.removeItem(STORAGE_KEYS.state);
  sessionStorage.removeItem(STORAGE_KEYS.nonce);
  sessionStorage.removeItem(STORAGE_KEYS.codeVerifier);
};

export const saveTokens = (tokens: StoredTokens) => {
  sessionStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens));
};

export const loadTokens = (): StoredTokens | null => {
  const raw = sessionStorage.getItem(STORAGE_KEYS.tokens);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
};

export const clearTokens = () => {
  sessionStorage.removeItem(STORAGE_KEYS.tokens);
};
