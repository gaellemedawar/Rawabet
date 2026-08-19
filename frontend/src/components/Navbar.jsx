import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CedarIcon } from './Motifs';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <CedarIcon className="brand-icon" size={22} />
        Rawa<span>bet</span>
      </Link>
      <div className="nav-links">
        {user && user.role === 'investor' && (
          <>
            <Link to="/deck">Discover</Link>
            <Link to="/browse/businesses">All Businesses</Link>
            <Link to="/matches">Matches</Link>
            <Link to="/onboarding">My Profile</Link>
          </>
        )}
        {user && user.role === 'business' && (
          <>
            <Link to="/likes">Interested Investors</Link>
            <Link to="/browse/investors">All Investors</Link>
            <Link to="/browse/businesses">All Businesses</Link>
            <Link to="/matches">Matches</Link>
            <Link to="/onboarding">My Business</Link>
          </>
        )}
        {user ? (
          <button className="btn-link" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="btn-primary-sm">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
