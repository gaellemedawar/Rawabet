import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useConstants } from '../api/useConstants';
import { useAuth } from '../context/AuthContext';

export default function InvestorOnboarding() {
  const { regions, niches, loading: constantsLoading } = useConstants();
  const { markOnboardingComplete } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    investmentMin: '',
    investmentMax: '',
    niches: [],
    geographicInterests: [],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    client
      .get('/investor/profile')
      .then(({ data }) => setForm({ ...data.profile }))
      .catch(() => {});
  }, []);

  function toggle(field, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await client.put('/investor/profile', form);
      markOnboardingComplete();
      navigate('/deck');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile');
    } finally {
      setSubmitting(false);
    }
  }

  if (constantsLoading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="onboarding-page">
      <form className="onboarding-card" onSubmit={handleSubmit}>
        <h1>Investor profile</h1>
        <p className="muted">Tell us what kind of Lebanese businesses you want to back.</p>

        {error && <div className="form-error">{error}</div>}

        <label>
          Full name
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </label>

        <label>
          Bio (optional)
          <textarea
            rows={3}
            maxLength={1000}
            value={form.bio || ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </label>

        <div className="two-col">
          <label>
            Min investment ($)
            <input
              type="number"
              min={0}
              required
              value={form.investmentMin}
              onChange={(e) => setForm({ ...form, investmentMin: e.target.value })}
            />
          </label>
          <label>
            Max investment ($)
            <input
              type="number"
              min={0}
              required
              value={form.investmentMax}
              onChange={(e) => setForm({ ...form, investmentMax: e.target.value })}
            />
          </label>
        </div>

        <fieldset>
          <legend>Niches you're interested in</legend>
          <div className="chip-group">
            {niches.map((n) => (
              <button
                type="button"
                key={n}
                className={`chip ${form.niches.includes(n) ? 'selected' : ''}`}
                onClick={() => toggle('niches', n)}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Regions of Lebanon you're interested in</legend>
          <div className="chip-group">
            {regions.map((r) => (
              <button
                type="button"
                key={r}
                className={`chip ${form.geographicInterests.includes(r) ? 'selected' : ''}`}
                onClick={() => toggle('geographicInterests', r)}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save & start discovering'}
        </button>
      </form>
    </div>
  );
}
