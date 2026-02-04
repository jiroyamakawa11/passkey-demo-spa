# Cognito 設定メモ

このサンプルは managed login を前提にしています。最低限の設定項目だけ記載します。

## User Pool

- サインイン識別子: Email
- パスワード認証: 有効
- パスキー: 有効
- MFA: 任意

### パスキー(デフォルト)
- ユーザー検証: 優先
- 依拠しているパーティーの ID のドメイン: Cognito プレフィックスドメイン

## App Client

- OAuth 2.0 フロー: Authorization Code
- Implicit Flow: 無効
- Client Secret: 不要
- Scopes: openid email profile aws.cognito.signin.user.admin phone


## callback

- Callback URL: `http://localhost:5173/callback`
- Logout URL: `http://localhost:5173/`

## ローカル環境

`.env.example` をコピーして `.env` を作成し、Cognito の値を入力してください。
