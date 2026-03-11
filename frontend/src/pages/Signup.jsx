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

  .auth-root::after {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
    bottom: -150px;
    right: -150px;
    pointer-events: none;
    animation: pulse-glow 7s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.15); opacity: 0.6; }
  }

  /* Right panel (form) comes first on signup */
  .auth-right {
    width: 520px;
    background: #161b22;
    border-right: 1px solid #21262d;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 52px 48px;
    position: relative;
    z-index: 1;
    animation: slideRight 0.6s ease both;
  }

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
    margin-bottom: 56px;
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

  .auth-brand-name span { color: #fbbf24; }

  .auth-headline {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(40px, 5vw, 68px);
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

  .auth-features {
    margin-top: 48px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: slideUp 0.7s ease 0.3s both;
  }

  .auth-feature {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .auth-feature-icon {
    width: 36px;
    height: 36px;
    background: rgba(251,191,36,0.08);
    border: 1px solid rgba(251,191,36,0.15);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .auth-feature-icon svg { color: #fbbf24; }

  .auth-feature-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #c9d1d9;
    margin-bottom: 3px;
  }

  .auth-feature-desc {
    font-size: 12px;
    color: #4b5563;
    line-height: 1.5;
  }

  .auth-form-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 28px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }

  .auth-form-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 28px;
  }

  .auth-form-subtitle a {
    color: #fbbf24;
    text-decoration: none;
    font-weight: 500;
  }

  .auth-form-subtitle a:hover { text-decoration: underline; }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6b7280;
    margin-bottom: 7px;
  }

  .form-input {
    width: 100%;
    background: #0d1117;
    border: 1px solid #21262d;
    border-radius: 6px;
    padding: 12px 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    color: #e8eaf0;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-input::placeholder { color: #374151; }

  .form-input:focus {
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
  }

  .form-input.error { border-color: rgba(239,68,68,0.5); }

  .form-select {
    width: 100%;
    background: #0d1117;
    border: 1px solid #21262d;
    border-radius: 6px;
    padding: 12px 14px;
    font-family: 'Barlow', sans-serif;
    font-size: 14px;
    color: #e8eaf0;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .form-select:focus {
    border-color: #fbbf24;
    box-shadow: 0 0 0 3px rgba(251,191,36,0.08);
  }

  .password-strength {
    margin-top: 6px;
    display: flex;
    gap: 4px;
  }

  .strength-bar {
    height: 3px;
    flex: 1;
    border-radius: 2px;
    background: #21262d;
    transition: background 0.3s;
  }

  .strength-bar.weak { background: #ef4444; }
  .strength-bar.medium { background: #f59e0b; }
  .strength-bar.strong { background: #22c55e; }

  .strength-label {
    font-size: 10px;
    margin-top: 4px;
    color: #4b5563;
  }

  .terms-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 16px 0 20px;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }

  .terms-row input[type="checkbox"] {
    accent-color: #fbbf24;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    margin-top: 2px;
    cursor: pointer;
  }

  .terms-row a {
    color: #fbbf24;
    text-decoration: none;
  }

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

  .btn-loader {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid #0d1117;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .alert {
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 16px;
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

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @media (max-width: 960px) {
    .auth-left { display: none; }
    .auth-right { width: 100%; border-right: none; }
  }
`;

function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", role: "citizen" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthClasses = ["", "weak", "medium", "medium", "strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!agreed) {
      setError("Please accept the terms and conditions.");
      return;
    }
    if (strength < 2) {
      setError("Please choose a stronger password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/signup", form);
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => { window.location.href = "/login"; }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        {/* Form panel (left on signup) */}
        <div className="auth-right">
          <div className="auth-form-title">Create Account</div>
          <p className="auth-form-subtitle">
            Already registered? <a href="/login">Sign in →</a>
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
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  name="name"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  className="form-input"
                  name="city"
                  placeholder="Hyderabad"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
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
              <label className="form-label">Password *</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              {form.password && (
                <>
                  <div className="password-strength">
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={`strength-bar ${i <= strength ? strengthClasses[strength] : ''}`}
                      />
                    ))}
                  </div>
                  <div className="strength-label">{strengthLabels[strength]} password</div>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Register as</label>
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="citizen">Citizen — Report civic issues</option>
                <option value="admin">Admin — Manage & resolve complaints</option>
              </select>
            </div>

            <label className="terms-row">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              I agree to the <a href="/terms">&nbsp;Terms of Service</a>&nbsp;and&nbsp;
              <a href="/privacy">Privacy Policy</a>. I understand my reports will be publicly visible.
            </label>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading && <span className="btn-loader" />}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Info panel (right on signup) */}
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
            Join the<br />
            <em>Movement.</em>
          </h1>

          <p className="auth-sub">
            Thousands of citizens are already using CivicEngine to make their neighborhoods safer, cleaner, and better governed.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div className="auth-feature-title">Pin It on the Map</div>
                <div className="auth-feature-desc">Drop a precise GPS pin on any civic issue — potholes, broken lights, garbage overflow, and more.</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <div className="auth-feature-title">Track Resolution</div>
                <div className="auth-feature-desc">Follow your complaint from submission to resolved. Get notified at every status change.</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div>
                <div className="auth-feature-title">Community Upvoting</div>
                <div className="auth-feature-desc">Neighbors can upvote your complaint, pushing high-priority issues to the top of the queue.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
