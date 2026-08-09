import './login.css';
import './signup.css';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const regionOptions = [
  'North America', 'Europe', 'Asia Pacific', 'South America', 'Middle East', 'Oceania',
];

const rankOptions = [
  'Bronze Player', 'Silver Player', 'Gold Player', 'Platinum Player',
  'Diamond Player', 'Pro Player', 'IGL', 'Entry Fragger', 'Sniper Specialist', 'Support Main',
];

function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [region, setRegion]           = useState('');
  const [rankTitle, setRankTitle]     = useState('');
  const [platform, setPlatform]       = useState('');
  const [availability, setAvailability] = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPwd) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!region) {
      setError('Please select your region');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, region, rankTitle: rankTitle || 'New Player', platform, availability }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setTimeout(() => navigate('/profile'), 1800);
      } else {
        setError(data.error || 'Sign up failed. Try a different username or email.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card signup-card">
        <div className="auth-logo">
          <div className="auth-logo__mark">TS</div>
          <span className="auth-logo__text">TeamSync</span>
        </div>

        <h1>Create account</h1>
        <p className="auth-sub">Join TeamSync and start finding your perfect squad.</p>

        {error && <div className="auth-error">⚠ {error}</div>}
        {success && (
          <div style={{ padding: '11px 14px', borderRadius: '10px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '0.84rem', marginBottom: '18px' }}>
            ✓ Account created! Redirecting to profile…
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <div className="signup-grid">
            <div className="field">
              <label htmlFor="su-username">Username</label>
              <input
                id="su-username"
                type="text"
                placeholder="e.g. ProSniper99"
                required
                maxLength={24}
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="su-email">Email</label>
              <input
                id="su-email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="signup-grid">
            <div className="field">
              <label htmlFor="su-password">Password</label>
              <input
                id="su-password"
                type="password"
                placeholder="Min. 6 characters"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="su-confirm-pwd">Confirm Password</label>
              <input
                id="su-confirm-pwd"
                type="password"
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
              />
            </div>
          </div>

          <div className="signup-section-label">Your Preferences</div>

          <div className="signup-grid">
            <div className="field">
              <label htmlFor="su-region">Region</label>
              <select
                id="su-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              >
                <option value="">Select region…</option>
                {regionOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="su-platform">Platform</label>
              <select
                id="su-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="">Any platform</option>
                <option>PC</option>
                <option>Console</option>
                <option>Cross-platform</option>
              </select>
            </div>
          </div>

          <div className="signup-grid">
            <div className="field">
              <label htmlFor="su-availability">Availability</label>
              <select
                id="su-availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="">Select availability…</option>
                <option>Evenings</option>
                <option>Late night</option>
                <option>Weekends</option>
                <option>Flexible</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="su-rank">Player Role / Rank</label>
              <select
                id="su-rank"
                value={rankTitle}
                onChange={(e) => setRankTitle(e.target.value)}
              >
                <option value="">Select a role…</option>
                {rankOptions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <button id="signup-submit-btn" type="submit" className="auth-btn" disabled={loading || success} style={{ marginTop: '8px' }}>
            {loading ? 'Creating account…' : success ? '✓ Done!' : 'Create Account →'}
          </button>
        </form>

        <p className="signup-login-link">
          Already have an account? <Link to="/">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
