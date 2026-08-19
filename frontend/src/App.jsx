import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import InvestorDeck from './pages/InvestorDeck';
import BusinessLikes from './pages/BusinessLikes';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import BrowseBusinesses from './pages/BrowseBusinesses';
import BrowseInvestors from './pages/BrowseInvestors';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deck"
            element={
              <ProtectedRoute role="investor">
                <InvestorDeck />
              </ProtectedRoute>
            }
          />
          <Route
            path="/likes"
            element={
              <ProtectedRoute role="business">
                <BusinessLikes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches/:matchId/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse/businesses"
            element={
              <ProtectedRoute>
                <BrowseBusinesses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse/investors"
            element={
              <ProtectedRoute role="business">
                <BrowseInvestors />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
