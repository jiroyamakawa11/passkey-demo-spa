import { Link } from "react-router-dom";
import { loadTokens } from "../auth/storage";
import { describeTokens } from "../auth/oidc";

export const Header = () => {
  const status = describeTokens(loadTokens());

  return (
    <header>
      <div className="app-title">
        <strong>Passkey Demo</strong>
        <span className="muted">Cognito Managed Login + SPA</span>
      </div>
      <nav>
        <Link to="/">ホーム</Link>
        <Link to="/mypage">マイページ</Link>
        <span className="tag">{status}</span>
      </nav>
    </header>
  );
};
