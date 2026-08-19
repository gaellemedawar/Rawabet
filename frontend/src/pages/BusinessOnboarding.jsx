import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { assetUrl } from '../api/assetUrl';
import { useConstants } from '../api/useConstants';
import { useAuth } from '../context/AuthContext';

export default function BusinessOnboarding() {
  const { regions, niches, loading: constantsLoading } = useConstants();
  const { markOnboardingComplete } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    description: '',
    niche: '',
    region: '',
    amountNeeded: '',
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    client
      .get('/business/profile')
      .then(({ data }) => {
        setForm({ ...data.profile });
        setExistingImages(data.profile.images || []);
      })
      .catch(() => {});
  }, []);

  async function handleDeleteImage(path) {
    const filename = path.split('/').pop();
    const { data } = await client.delete(`/business/profile/images/${filename}`);
    setExistingImages(data.profile.images);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      newFiles.forEach((file) => fd.append('images', file));

      await client.put('/business/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      markOnboardingComplete();
      navigate('/likes');
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
        <h1>Business profile</h1>
        <p className="muted">Show diaspora investors why your business is worth backing.</p>

        {error && <div className="form-error">{error}</div>}

        <div className="two-col">
          <label>
            Business name
            <input
              required
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
          </label>
          <label>
            Owner name
            <input
              required
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            rows={4}
            required
            maxLength={2000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What does your business do, why does it need funding, and what makes it credible?"
          />
        </label>

        <div className="two-col">
          <label>
            Niche
            <select required value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })}>
              <option value="" disabled>
                Select a niche
              </option>
              {niches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            Region
            <select required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              <option value="" disabled>
                Select a region
              </option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Amount needed ($)
          <input
            type="number"
            min={0}
            required
            value={form.amountNeeded}
            onChange={(e) => setForm({ ...form, amountNeeded: e.target.value })}
          />
        </label>

        <fieldset>
          <legend>Credibility photos</legend>
          {existingImages.length > 0 && (
            <div className="image-grid">
              {existingImages.map((path) => (
                <div className="image-thumb" key={path}>
                  <img src={assetUrl(path)} alt="Business" />
                  <button type="button" onClick={() => handleDeleteImage(path)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setNewFiles(Array.from(e.target.files))}
          />
          <p className="muted small">Up to 5 photos per upload, 5MB each.</p>
        </fieldset>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save business profile'}
        </button>
      </form>
    </div>
  );
}
