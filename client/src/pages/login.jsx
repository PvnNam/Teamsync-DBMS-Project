import './login.css';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { loginUser } from '../api';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      if (data.success) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo__mark">TS</div>
          <span className="auth-logo__text">TeamSync</span>
        </div>

        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to manage your gamer profile and squad rosters.</p>

        {error && <div className="auth-error">⚠ {error}</div>}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              type="text"
              placeholder="e.g. admin or pixelpilot"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-options">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign in →'}
          </button>
        </form>

        <div className="auth-hint">
          Quick demo login<br />
          <span>admin / admin</span>
        </div>

        <div className="auth-hint" style={{ marginTop: '10px' }}>
          Don’t have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Sign up →</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;