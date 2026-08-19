import { useEffect, useState } from 'react';
import client from '../api/client';
import { CoffeeCupIcon } from '../components/Motifs';

export default function BusinessLikes() {
  const [likes, setLikes] = useState(null);
  const [error, setError] = useState('');
  const [matchToast, setMatchToast] = useState(null);

  useEffect(() => {
    loadLikes();
  }, []);

  async function loadLikes() {
    setError('');
    try {
      const { data } = await client.get('/business/likes');
      setLikes(data.likes);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load interested investors');
    }
  }

  async function respond(entry, direction) {
    setLikes((l) => l.filter((e) => e.investor._id !== entry.investor._id));
    try {
      const { data } = await client.post('/business/swipe', {
        investorProfileId: entry.investor._id,
        direction,
      });
      if (data.matched) {
        setMatchToast(entry.investor.fullName);
        setTimeout(() => setMatchToast(null), 3000);
      }
    } catch {
      // entry already removed from view
    }
  }

  if (error) return <div className="page-message">{error}</div>;
  if (likes === null) return <div className="page-loading">Loading...</div>;

  return (
    <div className="likes-page">
      <h1>Investors interested in you</h1>
      <p className="muted">These diaspora investors swiped right on your business. Accept to unlock a match.</p>

      {matchToast && <div className="match-toast">🎉 It's a match with {matchToast}!</div>}

      {likes.length === 0 && (
        <div className="empty-state">
          <CoffeeCupIcon className="empty-state-icon" size={48} />
          <p className="muted">No pending interest yet — check back soon.</p>
        </div>
      )}

      <div className="likes-list">
        {likes.map((entry) => (
          <div className="like-card" key={entry.investor._id}>
            <div className="like-card-header">
              <h3>{entry.investor.fullName}</h3>
              {entry.aiScore != null && <span className="ai-score-badge small">{entry.aiScore}% match</span>}
            </div>
            <p className="muted">
              Budget: ${Number(entry.investor.investmentMin).toLocaleString()} - $
              {Number(entry.investor.investmentMax).toLocaleString()}
            </p>
            <p className="muted">Niches: {entry.investor.niches.join(', ')}</p>
            <p className="muted">Regions: {entry.investor.geographicInterests.join(', ')}</p>
            {entry.investor.bio && <p className="swipe-card-desc">{entry.investor.bio}</p>}
            {entry.aiExplanation && (
              <p className="ai-explanation">
                <strong>Why this match:</strong> {entry.aiExplanation}
              </p>
            )}
            <div className="like-card-actions">
              <button className="round-btn pass" onClick={() => respond(entry, 'pass')}>
                &times;
              </button>
              <button className="round-btn like" onClick={() => respond(entry, 'like')}>
                &hearts;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
