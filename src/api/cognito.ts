import type { OidcConfig, StoredTokens } from "../auth/types";

const buildCognitoIdpUrl = (region: string) =>
  `https://cognito-idp.${region}.amazonaws.com/`;

export const exchangeCodeForTokens = async (
  config: OidcConfig,
  code: string,
  codeVerifier: string
): Promise<StoredTokens> => {
  const url = `https://${config.domain}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    id_token: string;
    token_type: string;
    expires_in?: number;
  };

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    tokenType: data.token_type,
    expiresIn: data.expires_in,
  };
};

export type WebAuthnCredential = {
  credentialId: string;
  friendlyName?: string;
  createdAt?: string;
};

type ListWebAuthnResponse = {
  Credentials?: Array<{
    CredentialId: string;
    FriendlyName?: string;
    CreatedAt?: string;
  }>;
  NextToken?: string;
};

const callCognitoIdp = async <T>(
  region: string,
  target: string,
  accessToken: string,
  body: Record<string, unknown>
): Promise<T> => {
  const response = await fetch(buildCognitoIdpUrl(region), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": target,
      Authorization: accessToken,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cognito API failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as T;
};

export const listWebAuthnCredentials = async (
  region: string,
  accessToken: string
): Promise<WebAuthnCredential[]> => {
  const data = await callCognitoIdp<ListWebAuthnResponse>(
    region,
    "AWSCognitoIdentityProviderService.ListWebAuthnCredentials",
    accessToken,
    { AccessToken: accessToken }
  );

  return (
    data.Credentials?.map((cred) => ({
      credentialId: cred.CredentialId,
      friendlyName: cred.FriendlyName,
      createdAt: cred.CreatedAt,
    })) ?? []
  );
};

export const deleteWebAuthnCredential = async (
  region: string,
  accessToken: string,
  credentialId: string
) => {
  await callCognitoIdp<Record<string, never>>(
    region,
    "AWSCognitoIdentityProviderService.DeleteWebAuthnCredential",
    accessToken,
    {
      AccessToken: accessToken,
      CredentialId: credentialId,
    }
  );
};
