import { useState } from "react";
import { LoaderCircle, Shield } from "lucide-react";
import { api } from "../../../lib/api";

export function Login({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const session = await api.adminLogin({ email, password });
      onLogin(session.email);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="cms-login">
      <section className="cms-login-panel">
        <div className="cms-mark">
          <Shield size={24} />
        </div>
        <p className="cms-kicker">Portfolio CMS</p>
        <h1>Admin access</h1>
        <p className="cms-muted">
          Masuk dengan credential admin dari environment API.
        </p>
        <form onSubmit={submit} className="cms-login-form">
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {notice && <p className="cms-notice error">{notice}</p>}
          <button className="cms-button primary" disabled={loading}>
            {loading ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <Shield size={16} />
            )}{" "}
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
