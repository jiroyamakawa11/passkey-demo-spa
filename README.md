# Passkey Demo SPA (React + Cognito Managed Login)

Demo SPA for AWS Cognito Managed Login to experience Passkey (WebAuthn) flows without implementing WebAuthn on the SPA itself.

This repository focuses on:
- Using Cognito Managed Login with OAuth 2.0 Authorization Code + PKCE
- Safe handling of `state` and `nonce`
- Passkey (WebAuthn) registration flow delegated to Cognito
- Optional MFA enrollment via Authenticator App (TOTP) through Cognito APIs

日本語版: `README.ja.md`

## Features

- React + Vite + TypeScript SPA
- Cognito Hosted UI (Managed Login) sign-up / sign-in
- PKCE + state + nonce handling
- Token exchange and sessionStorage storage (no localStorage)
- Passkey list / delete via Cognito WebAuthn APIs
- Optional Authenticator App (TOTP) enrollment via Cognito APIs

## Prerequisites

- Node.js 20+
- AWS account with permissions to create Cognito User Pools
- Latest Chrome / Edge / Safari

## Setup

1) Configure Cognito (see `docs/cognito-setup.md`)

2) Create `.env` from `.env.example`

```env
VITE_COGNITO_DOMAIN=your-domain.auth.ap-northeast-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxx
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/callback
VITE_COGNITO_LOGOUT_URI=http://localhost:5173/
VITE_COGNITO_SCOPES=openid email profile aws.cognito.signin.user.admin
VITE_COGNITO_REGION=ap-northeast-1
VITE_USER_POOL_ID=ap-northeast-1_xxxxxxxx
```

3) Install and run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Cognito Configuration (summary)

- App client flow: Authorization Code + PKCE
- Scopes: `openid email profile aws.cognito.signin.user.admin`
- Callback URL: `http://localhost:5173/callback`
- Logout URL: `http://localhost:5173/`
- Passkey (WebAuthn): Enabled
- MFA: Optional, Authenticator App only

See `docs/cognito-setup.md` for details.

## Authentication Flow

```
SPA
 ├─ Generate PKCE / state / nonce
 ├─ Redirect to /oauth2/authorize
 │
Cognito Managed Login
 ├─ Sign up / Sign in
 ├─ Passkey registration / use
 │
SPA (/callback)
 ├─ Validate state
 ├─ Exchange code + code_verifier
 ├─ Validate nonce in id_token
 └─ Login completed
```

## Security Notes

This is a learning/demo project. Production systems should include:
- Strict CSP / XSS protections
- Token signature verification on backend
- Secure refresh token handling
- Audit logging and alerts

## License

MIT
