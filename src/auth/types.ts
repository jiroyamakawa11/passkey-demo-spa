export type StoredTokens = {
  accessToken: string;
  idToken: string;
  tokenType: string;
  expiresIn?: number;
};

export type OidcConfig = {
  domain: string;
  clientId: string;
  redirectUri: string;
  logoutUri: string;
  scopes: string;
};

export type IdTokenClaims = {
  sub: string;
  email?: string;
  nonce?: string;
};
