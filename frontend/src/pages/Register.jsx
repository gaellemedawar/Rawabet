import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CedarLandscape } from '../components/Motifs';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('investor');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(email, password, role);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-hero">
        <CedarLandscape className="auth-hero-bg" />
        <div className="auth-hero-content">
          <h1>Join Rawabet</h1>
          <p>
            Rawabet connects the Lebanese diaspora with local businesses back home. Set your
            niche, region and budget, and let AI find the matches worth backing.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Create your account</h2>
          <p className="muted">Connect the Lebanese diaspora with local businesses</p>

          {error && <div className="form-error">{error}</div>}

          <label>
            I am a...
            <div className="role-toggle">
              <button
                type="button"
                className={role === 'investor' ? 'active' : ''}
                onClick={() => setRole('investor')}
              >
                Investor
              </button>
              <button
                type="button"
                className={role === 'business' ? 'active' : ''}
                onClick={() => setRole('business')}
              >
                Business owner
              </button>
            </div>
          </label>

          <label>
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="muted small">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
