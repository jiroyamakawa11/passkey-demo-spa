import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildLogoutUrl, buildPasskeyUrl, decodeIdToken } from "../auth/oidc";
import { clearTokens, loadTokens } from "../auth/storage";
import { deleteWebAuthnCredential, listWebAuthnCredentials, type WebAuthnCredential } from "../api/cognito";
import { Header } from "../components/Header";

export const MyPage = () => {
  const tokens = loadTokens();
  const claims = useMemo(() => {
    if (!tokens) return null;
    try {
      return decodeIdToken(tokens.idToken);
    } catch {
      return null;
    }
  }, [tokens]);

  const handleLogout = () => {
    clearTokens();
    window.location.assign(buildLogoutUrl());
  };

  const handlePasskeyAdd = () => {
    window.location.assign(buildPasskeyUrl("add"));
  };

  const [passkeys, setPasskeys] = useState<WebAuthnCredential[]>([]);
  const [passkeyStatus, setPasskeyStatus] = useState<"idle" | "loading" | "error">("idle");
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const region = import.meta.env.VITE_COGNITO_REGION;

  const fetchPasskeys = async () => {
    if (!tokens?.accessToken) return;
    if (!region) {
      setPasskeyError("VITE_COGNITO_REGION が設定されていません。");
      setPasskeyStatus("error");
      return;
    }
    try {
      setPasskeyStatus("loading");
      setPasskeyError(null);
      const data = await listWebAuthnCredentials(region, tokens.accessToken);
      setPasskeys(data);
      setPasskeyStatus("idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Passkey 一覧の取得に失敗しました。";
      setPasskeyError(message);
      setPasskeyStatus("error");
    }
  };

  useEffect(() => {
    void fetchPasskeys();
  }, [tokens?.accessToken, region]);

  const handlePasskeyRemove = async (credentialId: string) => {
    if (!tokens?.accessToken || !region) return;
    try {
      setDeletingId(credentialId);
      await deleteWebAuthnCredential(region, tokens.accessToken, credentialId);
      await fetchPasskeys();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Passkey の削除に失敗しました。";
      setPasskeyError(message);
      setPasskeyStatus("error");
    } finally {
      setDeletingId(null);
    }
  };

  if (!tokens) {
    return (
      <div>
        <Header />
        <main className="stack">
          <section className="card stack">
            <h2>マイページ</h2>
            <p>ログインが必要です。</p>
            <Link to="/" className="button-link">
              ホームへ戻る
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="stack">
        <section className="card stack">
          <h2>ユーザー情報</h2>
          <div className="stack">
            <div>
              <span className="muted">Email</span>
              <div className="code">{claims?.email ?? "(未取得)"}</div>
            </div>
            <div>
              <span className="muted">User Sub</span>
              <div className="code">{claims?.sub ?? "(未取得)"}</div>
            </div>
          </div>
        </section>

        <div className="grid">
          <section className="card stack">
            <h2>Passkey 管理</h2>
            <p>
              登録は Cognito managed login で行い、削除や状態確認は WebAuthn API を呼び出して
              実行します。登録ボタンから認証画面へ遷移し、表示されるメニューから操作してください。
            </p>
            <div className="inline">
              <button type="button" onClick={handlePasskeyAdd}>
                Passkey を登録
              </button>
              <button type="button" className="secondary" onClick={fetchPasskeys}>
                状態を更新
              </button>
            </div>
            <div className="stack">
              <div className="tag">
                {passkeyStatus === "loading" ? "取得中..." : `登録数: ${passkeys.length}`}
              </div>
              {passkeyError && <p className="muted">{passkeyError}</p>}
              {passkeys.length === 0 ? (
                <p className="muted">Passkey はまだ登録されていません。</p>
              ) : (
                passkeys.map((passkey) => (
                  <div key={passkey.credentialId} className="card">
                    <div className="stack">
                      <div>
                        <span className="muted">Credential ID</span>
                        <div className="code">{passkey.credentialId}</div>
                      </div>
                      {passkey.friendlyName && (
                        <div>
                          <span className="muted">Friendly Name</span>
                          <div className="code">{passkey.friendlyName}</div>
                        </div>
                      )}
                      {passkey.createdAt && (
                        <div>
                          <span className="muted">Created</span>
                          <div className="code">{passkey.createdAt}</div>
                        </div>
                      )}
                      <div className="inline">
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => handlePasskeyRemove(passkey.credentialId)}
                          disabled={deletingId === passkey.credentialId}
                        >
                          Passkey を削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card stack">
            <h2>セッション</h2>
            <p>トークンは sessionStorage にのみ保存しています。</p>
            <div className="inline">
              <button type="button" className="secondary" onClick={handleLogout}>
                ログアウト
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
