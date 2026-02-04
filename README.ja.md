# Passkey Demo SPA (React + Cognito Managed Login)

AWS Cognito Managed Login を使って Passkey (WebAuthn) の流れを体験するためのデモ SPA です。  
SPA 側で WebAuthn を直接実装せず、Cognito に委譲する構成になっています。

英語版: `README.md`

## 特長

- React + Vite + TypeScript
- Cognito Hosted UI (Managed Login) によるサインアップ / サインイン
- PKCE + state + nonce の安全な扱い
- トークン交換と sessionStorage 保存（localStorage は使いません）
- Cognito WebAuthn API による Passkey 一覧 / 削除
- Cognito API による Authenticator App (TOTP) 登録

## 前提条件

- Node.js 20 以上
- Cognito User Pool を作成できる AWS アカウント
- 最新の Chrome / Edge / Safari

## セットアップ

1) Cognito の設定（`docs/cognito-setup.md` 参照）

2) `.env.example` をコピーして `.env` を作成

```env
VITE_COGNITO_DOMAIN=your-domain.auth.ap-northeast-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxx
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/callback
VITE_COGNITO_LOGOUT_URI=http://localhost:5173/
VITE_COGNITO_SCOPES=openid email profile aws.cognito.signin.user.admin
VITE_COGNITO_REGION=ap-northeast-1
VITE_USER_POOL_ID=ap-northeast-1_xxxxxxxx
```

3) 起動

```bash
npm install
npm run dev
```

http://localhost:5173 にアクセスしてください。

## Cognito 設定（要約）

- OAuth フロー: Authorization Code + PKCE
- Scopes: `openid email profile aws.cognito.signin.user.admin`
- Callback URL: `http://localhost:5173/callback`
- Logout URL: `http://localhost:5173/`
- Passkey (WebAuthn): 有効
- MFA: オプション（Authenticator App のみ）

詳細は `docs/cognito-setup.md` を参照してください。

## 認証フロー概要

```
SPA
 ├─ PKCE / state / nonce を生成
 ├─ /oauth2/authorize へリダイレクト
 │
Cognito Managed Login
 ├─ サインアップ / ログイン
 ├─ Passkey 登録 / 利用
 │
SPA (/callback)
 ├─ state 検証
 ├─ code + code_verifier で token 交換
 ├─ id_token の nonce 検証
 └─ ログイン完了
```

## セキュリティ注意事項

本リポジトリは学習・デモ用です。プロダクションでは以下が必要です:

- CSP / XSS 対策
- バックエンドでのトークン署名検証
- Refresh Token の安全な管理
- 監査ログ / アラート

## ライセンス

MIT
