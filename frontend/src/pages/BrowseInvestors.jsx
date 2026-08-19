import { useEffect, useState } from 'react';
import client from '../api/client';
import { useConstants } from '../api/useConstants';
import BrowseFilters from '../components/BrowseFilters';
import { CoffeeCupIcon } from '../components/Motifs';

const EMPTY_FILTERS = { niche: '', region: '', minAmount: '', maxAmount: '' };

export default function BrowseInvestors() {
  const { niches, regions } = useConstants();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [investors, setInvestors] = useState(null);
  const [error, setError] = useState('');
  const [interestedIds, setInterestedIds] = useState(new Set());
  const [matchToast, setMatchToast] = useState(null);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });

    client
      .get('/browse/investors', { params })
      .then(({ data }) => setInvestors(data.investors))
      .catch((err) => setError(err.response?.data?.message || 'Could not load investors'));
  }, [filters]);

  async function expressInterest(investor) {
    setInterestedIds((prev) => new Set(prev).add(investor._id));
    try {
      const { data } = await client.post('/business/swipe', { investorProfileId: investor._id, direction: 'like' });
      if (data.matched) {
        setMatchToast(investor.fullName);
        setTimeout(() => setMatchToast(null), 3000);
      }
    } catch {
      // leave it marked as interested locally; not worth rolling back for this small project
    }
  }

  if (error) return <div className="page-message">{error}</div>;
  if (investors === null) return <div className="page-loading">Loading investors...</div>;

  return (
    <div className="browse-page">
      <h1>All investors</h1>
      <p className="muted">
        Every diaspora investor on Rawabet, beyond the ones who've already liked you. Filter and reach
        out directly.
      </p>

      <BrowseFilters niches={niches} regions={regions} filters={filters} onChange={setFilters} />

      {matchToast && <div className="match-toast">🎉 It's a match with {matchToast}!</div>}

      {investors.length === 0 && (
        <div className="empty-state">
          <CoffeeCupIcon className="empty-state-icon" size={48} />
          <p className="muted">No investors match those filters.</p>
        </div>
      )}

      <div className="browse-grid">
        {investors.map((inv) => (
          <div className="browse-card" key={inv._id}>
            <div className="browse-card-body">
              <h3>{inv.fullName}</h3>
              <p className="muted">
                Budget: ${Number(inv.investmentMin).toLocaleString()} - ${Number(inv.investmentMax).toLocaleString()}
              </p>
              <p className="muted">Niches: {inv.niches.join(', ')}</p>
              <p className="muted">Regions: {inv.geographicInterests.join(', ')}</p>
              {inv.bio && <p className="browse-card-desc">{inv.bio}</p>}
              <button
                type="button"
                className="btn-primary-sm"
                disabled={interestedIds.has(inv._id)}
                onClick={() => expressInterest(inv)}
              >
                {interestedIds.has(inv._id) ? 'Interested ✓' : "I'm interested"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
