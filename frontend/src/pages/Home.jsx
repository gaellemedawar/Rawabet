import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CedarIcon, CoffeeCupIcon, MosaicDivider } from '../components/Motifs';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="home-motif-row">
        <CoffeeCupIcon className="home-motif-icon" size={40} />
        <CedarIcon className="home-motif-icon" size={40} />
      </div>

      <h1>
        Invest in Lebanon, <span>powered by AI</span>
      </h1>
      <p className="muted lead">
        Rawabet matches Lebanese diaspora investors with local businesses seeking funding &mdash; think
        Tinder, but for meaningful investment. Our AI reads every profile and ranks matches by niche,
        geography and fit.
      </p>

      <MosaicDivider className="home-mosaic" />

      {!user && (
        <div className="home-actions">
          <Link to="/register" className="btn-primary">
            Get started
          </Link>
          <Link to="/login">Log in</Link>
        </div>
      )}

      {user && user.role === 'investor' && (
        <div className="home-actions">
          <Link to="/deck" className="btn-primary">
            Start discovering businesses
          </Link>
        </div>
      )}

      {user && user.role === 'business' && (
        <div className="home-actions">
          <Link to="/likes" className="btn-primary">
            See interested investors
          </Link>
        </div>
      )}
    </div>
  );
}
