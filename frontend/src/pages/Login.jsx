import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CedarLandscape } from '../components/Motifs';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.onboardingComplete ? '/' : '/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-hero">
        <CedarLandscape className="auth-hero-bg" />
        <div className="auth-hero-content">
          <h1>Welcome to Rawabet</h1>
          <p>
            Rawabet connects the Lebanese diaspora with local businesses back home. Set your
            niche, region and budget, and let AI find the matches worth backing.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Log in</h2>
          <p className="muted">Welcome back — log in to your account</p>

          {error && <div className="form-error">{error}</div>}

          <label>
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>

          <p className="muted small">
            No account yet? <Link to="/register">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
