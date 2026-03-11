import { useState } from "react";
import API from "../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    background: #0d1117;
    display: flex;
    font-family: 'Barlow', sans-serif;
    color: #e8eaf0;
    position: relative;
    overflow: hidden;
  }

  /* Animated grid background */
  .auth-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(251,191,36,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(251,191,36,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  /* Glow blob */
  .auth-root::after {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
    top: -150px;
    left: -150px;
    pointer-events: none;
    animation: pulse-glow 6s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
  }

  /* Left panel */
  .auth-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 80px;
    position: relative;
    z-index: 1;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 64px;
    animation: slideDown 0.6s ease both;
  }

  .auth-brand-icon {
    width: 40px;
    height: 40px;
    background: #fbbf24;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .auth-brand-icon svg {
    width: 22px;
    height: 22px;
    color: #0d1117;
  }

  .auth-brand-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #e8eaf0;
  }

  .auth-brand-name span {
    color: #fbbf24;
  }

  .auth-headline {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(48px, 6vw, 80px);
    font-weight: 800;
    line-height: 0.95;
    letter-spacing: -0.01em;
    text-transform: uppercase;
    margin-bottom: 24px;
    animation: slideUp 0.7s ease 0.1s both;
  }

  .auth-headline em {
    color: #fbbf24;
    font-style: normal;
    display: block;
  }

  .auth-sub {
    font-size: 15px;
    font-weight: 300;
    color: #6b7280;
    line-height: 1.6;
    max-width: 340px;
    animation: slideUp 0.7s ease 0.2s both;
  }

  .auth-stats {
    display: flex;
    gap: 40px;
    margin-top: 56px;
    animation: slideUp 0.7s ease 0.3s both;
  }

  .auth-stat-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #fbbf24;
    line-height: 1;
  }

  .auth-stat-label {
    font-size: 11px;
    font-weight: 500;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 4px;
  }

  /* Right panel - form */
  .auth-right {
    width: 480px;
    background: #161b22;
    border-left: 1px solid #21262d;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 48px;
    position: relative;
    z-index: 1;
    animation: slideLeft 0.6s ease both;
  }

  .auth-form-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }

  .auth-form-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 36px;
  }

  .auth-form-subtitle a {
    color: #fbbf24;
    text-decoration: none;
    font-weight: 500;
  }

  .auth-form-subtitle a:hover { text-decoration: underline; }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .form-input {
    width: 100%;
    background: #0d1117;
    border: 1px solid #21262d;
    border-radius: 6px;
    padding: 13px 16px;
    font-family: 'Barlow', sans-serif;
    font-size: 15px;
    color: #e8eaf0;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-input::placeholder { color: #374151; }

  .form-input:focus {
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
  }

  .form-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .form-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
  }

  .form-remember input[type="checkbox"] {
    accent-color: #fbbf24;
    width: 14px;
    height: 14px;
  }

  .form-forgot {
    font-size: 13px;
    color: #fbbf24;
    text-decoration: none;
  }

  .form-forgot:hover { text-decoration: underline; }

  .btn-submit {
    width: 100%;
    background: #fbbf24;
    color: #0d1117;
    border: none;
    border-radius: 6px;
    padding: 14px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  .btn-submit:hover {
    background: #f59e0b;
    box-shadow: 0 0 24px rgba(251,191,36,0.3);
  }

  .btn-submit:active { transform: scale(0.99); }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-submit .btn-loader {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #0d1117;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #21262d;
  }

  .auth-divider span {
    font-size: 11px;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .alert {
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .alert-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    color: #f87171;
  }

  .alert-success {
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
    color: #4ade80;
  }

  .auth-badge {
    position: absolute;
    bottom: 32px;
    left: 48px;
    right: 48px;
    padding: 12px 16px;
    background: rgba(251,191,36,0.04);
    border: 1px solid rgba(251,191,36,0.1);
    border-radius: 6px;
    font-size: 11px;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .auth-badge svg { color: #fbbf24; flex-shrink: 0; }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @media (max-width: 900px) {
    .auth-left { display: none; }
    .auth-right { width: 100%; border-left: none; }
  }
`;

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => { window.location.href = "/dashboard"; }, 800);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        {/* Left branding panel */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="auth-brand-name">Civic<span>Engine</span></div>
          </div>

          <h1 className="auth-headline">
            Your Voice.<br />
            <em>Their Action.</em>
          </h1>

          <p className="auth-sub">
            Report civic issues directly to local authorities. Track progress, demand accountability, and make your city better — one complaint at a time.
          </p>

          <div className="auth-stats">
            <div>
              <div className="auth-stat-num">12,847</div>
              <div className="auth-stat-label">Issues Reported</div>
            </div>
            <div>
              <div className="auth-stat-num">68%</div>
              <div className="auth-stat-label">Resolution Rate</div>
            </div>
            <div>
              <div className="auth-stat-num">142</div>
              <div className="auth-stat-label">Wards Covered</div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-right">
          <div className="auth-form-title">Sign In</div>
          <p className="auth-form-subtitle">
            New to CivicEngine? <a href="/signup">Create an account →</a>
          </p>

          {error && (
            <div className="alert alert-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <div className="form-row">
              <label className="form-remember">
                <input type="checkbox" /> Remember me
              </label>
              <a href="/forgot-password" className="form-forgot">Forgot password?</a>
            </div>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading && <span className="btn-loader" />}
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="auth-divider"><span>or continue as</span></div>

          <button
            className="btn-submit"
            style={{ background: 'transparent', border: '1px solid #21262d', color: '#9ca3af' }}
            onClick={() => window.location.href = '/public-map'}
          >
            👁 View Public Map (No Login)
          </button>

          <div className="auth-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Secured with JWT authentication. Your data is encrypted and private.
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
