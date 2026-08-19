import { useRef, useState } from 'react';
import { assetUrl } from '../api/assetUrl';

const SWIPE_THRESHOLD = 120;

export default function SwipeCard({ business, aiScore, aiExplanation, active, onSwipe, style }) {
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const startRef = useRef({ x: 0, y: 0 });
  const image = business.images?.[0];

  function handlePointerDown(e) {
    if (!active) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag((d) => ({ ...d, dragging: true }));
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!active || !drag.dragging) return;
    setDrag({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
      dragging: true,
    });
  }

  function handlePointerUp() {
    if (!active) return;
    if (drag.x > SWIPE_THRESHOLD) {
      onSwipe('like');
    } else if (drag.x < -SWIPE_THRESHOLD) {
      onSwipe('pass');
    }
    setDrag({ x: 0, y: 0, dragging: false });
  }

  const rotation = drag.x / 15;
  const cardStyle = active
    ? {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`,
        transition: drag.dragging ? 'none' : 'transform 0.3s ease',
        ...style,
      }
    : style;

  const likeOpacity = active ? Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1) : 0;
  const passOpacity = active ? Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1) : 0;

  return (
    <div
      className="swipe-card"
      style={cardStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="swipe-card-image">
        {image ? <img src={assetUrl(image)} alt={business.businessName} draggable={false} /> : <div className="no-image">No photo yet</div>}
        <div className="stamp stamp-like" style={{ opacity: likeOpacity }}>
          LIKE
        </div>
        <div className="stamp stamp-pass" style={{ opacity: passOpacity }}>
          PASS
        </div>
        <div className="ai-score-badge">{aiScore}% match</div>
      </div>

      <div className="swipe-card-body">
        <h2>{business.businessName}</h2>
        <p className="swipe-card-meta">
          {business.niche} &middot; {business.region}
        </p>
        <p className="swipe-card-amount">Seeking ${Number(business.amountNeeded).toLocaleString()}</p>
        <p className="swipe-card-desc">{business.description}</p>
        {aiExplanation && (
          <p className="ai-explanation">
            <strong>Why this match:</strong> {aiExplanation}
          </p>
        )}
      </div>
    </div>
  );
}
