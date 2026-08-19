import { useEffect, useState } from 'react';
import client from '../api/client';
import { assetUrl } from '../api/assetUrl';
import { useConstants } from '../api/useConstants';
import { useAuth } from '../context/AuthContext';
import BrowseFilters from '../components/BrowseFilters';
import { CoffeeCupIcon } from '../components/Motifs';

const EMPTY_FILTERS = { niche: '', region: '', minAmount: '', maxAmount: '' };

export default function BrowseBusinesses() {
  const { user } = useAuth();
  const { niches, regions } = useConstants();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [businesses, setBusinesses] = useState(null);
  const [error, setError] = useState('');
  const [interestedIds, setInterestedIds] = useState(new Set());
  const [matchToast, setMatchToast] = useState(null);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });

    client
      .get('/browse/businesses', { params })
      .then(({ data }) => setBusinesses(data.businesses))
      .catch((err) => setError(err.response?.data?.message || 'Could not load businesses'));
  }, [filters]);

  async function expressInterest(business) {
    setInterestedIds((prev) => new Set(prev).add(business._id));
    try {
      const { data } = await client.post('/deck/swipe', { businessId: business._id, direction: 'like' });
      if (data.matched) {
        setMatchToast(business.businessName);
        setTimeout(() => setMatchToast(null), 3000);
      }
    } catch {
      // leave it marked as interested locally; not worth rolling back for this small project
    }
  }

  if (error) return <div className="page-message">{error}</div>;
  if (businesses === null) return <div className="page-loading">Loading businesses...</div>;

  return (
    <div className="browse-page">
      <h1>All businesses</h1>
      <p className="muted">
        {user.role === 'investor'
          ? 'Every business on Rawabet, beyond your curated deck. Filter and express interest directly.'
          : "Browse the other businesses on Rawabet — see who else diaspora investors are backing."}
      </p>

      <BrowseFilters niches={niches} regions={regions} filters={filters} onChange={setFilters} />

      {matchToast && <div className="match-toast">🎉 It's a match with {matchToast}!</div>}

      {businesses.length === 0 && (
        <div className="empty-state">
          <CoffeeCupIcon className="empty-state-icon" size={48} />
          <p className="muted">No businesses match those filters.</p>
        </div>
      )}

      <div className="browse-grid">
        {businesses.map((b) => (
          <div className="browse-card" key={b._id}>
            {b.images?.[0] && <img src={assetUrl(b.images[0])} alt={b.businessName} />}
            <div className="browse-card-body">
              <h3>{b.businessName}</h3>
              <p className="muted">
                {b.niche} &middot; {b.region}
              </p>
              <p className="browse-card-amount">Seeking ${Number(b.amountNeeded).toLocaleString()}</p>
              <p className="browse-card-desc">{b.description}</p>
              {user.role === 'investor' && (
                <button
                  type="button"
                  className="btn-primary-sm"
                  disabled={interestedIds.has(b._id)}
                  onClick={() => expressInterest(b)}
                >
                  {interestedIds.has(b._id) ? 'Interested ✓' : "I'm interested"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
