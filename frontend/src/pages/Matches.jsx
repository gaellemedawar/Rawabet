import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { assetUrl } from '../api/assetUrl';
import { useAuth } from '../context/AuthContext';
import { CoffeeCupIcon } from '../components/Motifs';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get('/matches')
      .then(({ data }) => setMatches(data.matches))
      .catch((err) => setError(err.response?.data?.message || 'Could not load matches'));
  }, []);

  if (error) return <div className="page-message">{error}</div>;
  if (matches === null) return <div className="page-loading">Loading matches...</div>;

  return (
    <div className="matches-page">
      <h1>Your matches</h1>
      {matches.length === 0 && (
        <div className="empty-state">
          <CoffeeCupIcon className="empty-state-icon" size={48} />
          <p className="muted">No matches yet — keep swiping!</p>
        </div>
      )}

      <div className="matches-list">
        {matches.map((m) =>
          user.role === 'investor' ? (
            <div className="match-card" key={m._id}>
              {m.businessProfile?.images?.[0] && (
                <img src={assetUrl(m.businessProfile.images[0])} alt={m.businessProfile.businessName} />
              )}
              <div>
                <h3>{m.businessProfile?.businessName}</h3>
                <p className="muted">
                  {m.businessProfile?.niche} &middot; {m.businessProfile?.region}
                </p>
                <p className="muted">Contact: {m.businessProfile?.user?.email}</p>
                {m.aiScore != null && <span className="ai-score-badge small">{m.aiScore}% match</span>}
                <Link
                  to={`/matches/${m._id}/chat`}
                  state={{ counterpartName: m.businessProfile?.businessName }}
                  className="btn-primary-sm match-chat-link"
                >
                  Chat
                </Link>
              </div>
            </div>
          ) : (
            <div className="match-card" key={m._id}>
              <div>
                <h3>{m.investorProfile?.fullName}</h3>
                <p className="muted">
                  Budget: ${Number(m.investorProfile?.investmentMin).toLocaleString()} - $
                  {Number(m.investorProfile?.investmentMax).toLocaleString()}
                </p>
                <p className="muted">Contact: {m.investorProfile?.user?.email}</p>
                {m.aiScore != null && <span className="ai-score-badge small">{m.aiScore}% match</span>}
                <Link
                  to={`/matches/${m._id}/chat`}
                  state={{ counterpartName: m.investorProfile?.fullName }}
                  className="btn-primary-sm match-chat-link"
                >
                  Chat
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
