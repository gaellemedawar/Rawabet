// Small hand-drawn icons and a geometric divider giving the UI a bit of
// Lebanese character — a cedar silhouette and a traditional coffee cup
// (finjan), plus a tile-inspired divider strip. All inline SVG, no assets.

export function CedarIcon({ className, size = 24 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M24 3 L31 16 H26 L33 27 H27 L35 40 H13 L21 27 H15 L22 16 H17 Z" />
      <rect x="21" y="40" width="6" height="5" />
    </svg>
  );
}

export function CoffeeCupIcon({ className, size = 24 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 20 H32 L29 34 H19 Z" fill="currentColor" />
      <ellipse cx="24" cy="20" rx="8" ry="2.2" fill="currentColor" opacity="0.85" />
      <ellipse cx="24" cy="37" rx="15" ry="3.4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19 10c-2 2-2 4 0 6M27 10c2 2 2 4 0 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TREE_PATH = 'M24 3 L31 16 H26 L33 27 H27 L35 40 H13 L21 27 H15 L22 16 H17 Z';

// A cluster of cedar silhouettes standing on a ridge at dusk, largest and
// most opaque in the center as a focal point, fading toward the edges for
// a sense of depth. All positions pre-computed so tree bases sit roughly
// along the same ridge line regardless of scale.
const TREES = [
  { x: 40, y: 613, scale: 1.6, opacity: 0.45 },
  { x: 130, y: 597, scale: 2.4, opacity: 0.65 },
  { x: 200, y: 609, scale: 1.8, opacity: 0.5 },
  { x: 290, y: 598, scale: 3.6, opacity: 1 },
  { x: 370, y: 601, scale: 3.2, opacity: 0.85 },
  { x: 460, y: 605, scale: 3.0, opacity: 0.7 },
  { x: 550, y: 613, scale: 1.6, opacity: 0.4 },
];

// A stylized dusk landscape of the Cedars of Lebanon — no photo available
// for a self-contained demo, so this is an original hand-drawn illustration
// in the same palette as the rest of the UI. Fills its container like a
// background image via preserveAspectRatio="slice".
export function CedarLandscape({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cedarSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123b2c" />
          <stop offset="55%" stopColor="#8a1f1f" />
          <stop offset="100%" stopColor="#c8102e" />
        </linearGradient>
        <radialGradient id="cedarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8d488" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f8d488" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="600" height="800" fill="url(#cedarSky)" />
      <circle cx="420" cy="520" r="160" fill="url(#cedarGlow)" />
      <circle cx="420" cy="520" r="70" fill="#f7f5f0" opacity="0.9" />

      <path
        d="M0 560 L80 520 L160 555 L260 500 L360 545 L460 505 L600 550 L600 800 L0 800 Z"
        fill="#3a1512"
        opacity="0.6"
      />

      {TREES.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.scale})`} opacity={t.opacity}>
          <path d={TREE_PATH} fill="#164e3a" />
          <rect x="21" y="40" width="6" height="6" fill="#164e3a" />
        </g>
      ))}
    </svg>
  );
}

export function MosaicDivider({ className, count = 12 }) {
  const tiles = Array.from({ length: count });
  return (
    <svg
      className={className}
      viewBox={`0 0 ${count * 20} 20`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {tiles.map((_, i) => (
        <polygon
          key={i}
          points={`${i * 20 + 10},2 ${i * 20 + 18},10 ${i * 20 + 10},18 ${i * 20 + 2},10`}
          fill={i % 2 === 0 ? 'var(--primary)' : 'var(--accent-gold)'}
        />
      ))}
    </svg>
  );
}
