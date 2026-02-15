import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleCallback } from "../auth/oidc";
import { Header } from "../components/Header";

export const Callback = () => {
  const [status, setStatus] = useState("認証情報を確認しています...");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const errorParam = params.get("error");
      const result = params.get("result");

      if (errorParam) {
        setError(`認証エラー: ${errorParam}`);
        return;
      }

      if (result === "success" && !code && !state) {
        setStatus("Passkey 操作が完了しました。マイページに戻ります...");
        setTimeout(() => navigate("/mypage"), 700);
        return;
      }

      if (!code || !state) {
        setError("必要なパラメータが不足しています。最初からログインしてください。");
        return;
      }

      try {
        setStatus("トークンを取得しています...");
        await handleCallback(code, state);
        setStatus("ログイン完了。マイページに移動します...");
        setTimeout(() => navigate("/mypage"), 700);
      } catch (err) {
        const message = err instanceof Error ? err.message : "未知のエラーが発生しました。";
        setError(message);
      }
    };

    void run();
  }, [navigate]);

  return (
    <div>
      <Header />
      <main className="stack">
        <section className="card stack">
          <h2>コールバック処理</h2>
          {error ? (
            <>
              <p className="muted">{error}</p>
              <p>
                もう一度 <a href="/">ホーム</a> からログインを開始してください。
              </p>
            </>
          ) : (
            <p className="muted">{status}</p>
          )}
        </section>
      </main>
    </div>
  );
};
