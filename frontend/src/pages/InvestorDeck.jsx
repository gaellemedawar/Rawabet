import { useEffect, useState } from 'react';
import client from '../api/client';
import SwipeCard from '../components/SwipeCard';
import { CoffeeCupIcon } from '../components/Motifs';

export default function InvestorDeck() {
  const [deck, setDeck] = useState(null);
  const [error, setError] = useState('');
  const [matchToast, setMatchToast] = useState(null);

  useEffect(() => {
    loadDeck();
  }, []);

  async function loadDeck() {
    setError('');
    try {
      const { data } = await client.get('/deck');
      setDeck(data.deck);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your deck');
    }
  }

  async function handleSwipe(entry, direction) {
    setDeck((d) => d.filter((e) => e.business._id !== entry.business._id));
    try {
      const { data } = await client.post('/deck/swipe', {
        businessId: entry.business._id,
        direction,
        aiScore: entry.aiScore,
        aiExplanation: entry.aiExplanation,
      });
      if (data.matched) {
        setMatchToast(entry.business.businessName);
        setTimeout(() => setMatchToast(null), 3000);
      }
    } catch {
      // swipe already removed from view; nothing else to roll back for this small project
    }
  }

  if (error) return <div className="page-message">{error}</div>;
  if (deck === null) return <div className="page-loading">Loading your deck...</div>;

  return (
    <div className="deck-page">
      <h1>Discover businesses</h1>

      {matchToast && <div className="match-toast">🎉 It's a match with {matchToast}!</div>}

      <div className="card-stack">
        {deck.length === 0 && (
          <div className="empty-deck">
            <CoffeeCupIcon className="empty-state-icon" size={48} />
            <p>No more businesses to show right now — grab a coffee and check back later.</p>
            <button className="btn-primary" onClick={loadDeck}>
              Refresh
            </button>
          </div>
        )}
        {deck
          .slice(0, 3)
          .reverse()
          .map((entry, i, arr) => (
            <SwipeCard
              key={entry.business._id}
              business={entry.business}
              aiScore={entry.aiScore}
              aiExplanation={entry.aiExplanation}
              active={i === arr.length - 1}
              onSwipe={(direction) => handleSwipe(entry, direction)}
              style={{ zIndex: i }}
            />
          ))}
      </div>

      {deck.length > 0 && (
        <div className="swipe-actions">
          <button className="round-btn pass" onClick={() => handleSwipe(deck[0], 'pass')}>
            &times;
          </button>
          <button className="round-btn like" onClick={() => handleSwipe(deck[0], 'like')}>
            &hearts;
          </button>
        </div>
      )}
    </div>
  );
}
