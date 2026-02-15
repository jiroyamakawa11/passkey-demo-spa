import type { IdTokenClaims, OidcConfig, StoredTokens } from "./types";
import { generateNonce, generatePkce } from "./pkce";
import { clearAuthRequest, loadAuthRequest, saveAuthRequest, saveTokens } from "./storage";
import { exchangeCodeForTokens } from "../api/cognito";

const base64UrlDecode = (value: string) => {
  const padding = 4 - (value.length % 4 || 4);
  const padded = value + "=".repeat(padding === 4 ? 0 : padding);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const decodeIdToken = (token: string): IdTokenClaims => {
  const [, payload] = token.split(".");
  if (!payload) {
    throw new Error("Invalid id_token format");
  }
  const json = base64UrlDecode(payload);
  return JSON.parse(json) as IdTokenClaims;
};

export const getOidcConfig = (): OidcConfig => {
  const {
    VITE_COGNITO_DOMAIN,
    VITE_COGNITO_CLIENT_ID,
    VITE_COGNITO_REDIRECT_URI,
    VITE_COGNITO_LOGOUT_URI,
    VITE_COGNITO_SCOPES,
  } = import.meta.env;

  if (
    !VITE_COGNITO_DOMAIN ||
    !VITE_COGNITO_CLIENT_ID ||
    !VITE_COGNITO_REDIRECT_URI ||
    !VITE_COGNITO_LOGOUT_URI ||
    !VITE_COGNITO_SCOPES
  ) {
    throw new Error("Missing required VITE_ environment variables.");
  }

  const normalizeDomain = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return new URL(trimmed).host;
    }
    return trimmed.split("/")[0];
  };

  return {
    domain: normalizeDomain(VITE_COGNITO_DOMAIN),
    clientId: VITE_COGNITO_CLIENT_ID,
    redirectUri: VITE_COGNITO_REDIRECT_URI,
    logoutUri: VITE_COGNITO_LOGOUT_URI,
    scopes: VITE_COGNITO_SCOPES,
  };
};

// Cognito の認可エンドポイント仕様（参照ドキュメント）
// https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html
export const buildAuthorizeUrl = async (options?: { prompt?: string }) => {
  const config = getOidcConfig();
  const { verifier, challenge } = await generatePkce();
  const state = generateNonce(16);
  const nonce = generateNonce(24);
  saveAuthRequest(state, nonce, verifier);

  const url = new URL(`https://${config.domain}/oauth2/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", config.scopes);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("lang", "ja");

  if (options?.prompt) {
    url.searchParams.set("prompt", options.prompt);
  }

  return url.toString();
};

export const handleCallback = async (code: string, stateFromCallback: string) => {
  const { state, nonce, codeVerifier } = loadAuthRequest();

  if (!state || !nonce || !codeVerifier) {
    throw new Error("Auth request not found. Please start login again.");
  }

  if (state !== stateFromCallback) {
    throw new Error("State mismatch. Possible CSRF detected.");
  }

  const config = getOidcConfig();
  const tokens = await exchangeCodeForTokens(config, code, codeVerifier);

  const claims = decodeIdToken(tokens.idToken);
  if (claims.nonce !== nonce) {
    throw new Error("Nonce mismatch. Invalid id_token.");
  }

  clearAuthRequest();
  saveTokens(tokens);

  return tokens;
};

// Cognito のログアウトエンドポイント仕様（参照ドキュメント）
// https://docs.aws.amazon.com/cognito/latest/developerguide/logout-endpoint.html
export const buildLogoutUrl = () => {
  const config = getOidcConfig();
  const url = new URL(`https://${config.domain}/logout`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("logout_uri", config.logoutUri);
  url.searchParams.set("lang", "ja");
  return url.toString();
};

// Cognito の managed login エンドポイント概要（Passkey の add/remove を参照）
// https://docs.aws.amazon.com/cognito/latest/developerguide/managed-login-endpoints.html
export const buildPasskeyUrl = (action: "add" | "remove") => {
  const config = getOidcConfig();
  const url = new URL(`https://${config.domain}/passkeys/${action}`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  return url.toString();
};

export const describeTokens = (tokens: StoredTokens | null) => {
  if (!tokens) {
    return "未ログイン";
  }
  return "ログイン済み";
};
