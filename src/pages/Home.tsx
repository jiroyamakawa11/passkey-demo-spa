import { useState } from "react";
import { Link } from "react-router-dom";
import { buildAuthorizeUrl, buildLogoutUrl } from "../auth/oidc";
import { clearTokens, loadTokens } from "../auth/storage";
import { Header } from "../components/Header";
import { StatusCard } from "../components/StatusCard";

export const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const tokens = loadTokens();

  const handleLogin = async () => {
    setIsLoading(true);
    const url = await buildAuthorizeUrl();
    window.location.assign(url);
  };

  const handleLogout = () => {
    clearTokens();
    window.location.assign(buildLogoutUrl());
  };

  return (
    <div>
      <Header />
      <main className="stack">
        <StatusCard title="このサンプルについて">
          <p>
            Cognito のマネージドログインで Passkey を体験するための SPA です。WebAuthn
            の実装は行わず、OAuth 2.0 + PKCE の最小フローを学べます。
          </p>
          <div className="tag">学習用 / デモ用途</div>
        </StatusCard>

        <StatusCard title="サインイン状態">
          {tokens ? (
            <>
              <p>ログイン済みです。マイページでユーザー情報と Passkey 導線を確認できます。</p>
              <div className="inline">
                <Link to="/mypage" className="button-link">
                  マイページへ
                </Link>
                <button type="button" className="secondary" onClick={handleLogout}>
                  ログアウト
                </button>
              </div>
            </>
          ) : (
            <>
              <p>未ログインです。managed login に遷移してサインアップ / ログインしてください。</p>
              <div className="inline">
                <button type="button" onClick={handleLogin} disabled={isLoading}>
                  サインアップ / ログイン
                </button>
              </div>
            </>
          )}
        </StatusCard>

        <section className="card stack">
          <h2>フロー概要</h2>
          <ol className="stack">
            <li>PKCE / state / nonce を生成して managed login にリダイレクト</li>
            <li>managed login でサインイン・Passkey 登録</li>
            <li>/callback で token 交換と nonce 検証</li>
            <li>トークンを sessionStorage に保持</li>
          </ol>
        </section>
      </main>
    </div>
  );
};
