import { useAuth } from '../context/AuthContext';
import InvestorOnboarding from './InvestorOnboarding';
import BusinessOnboarding from './BusinessOnboarding';

export default function Onboarding() {
  const { user } = useAuth();
  return user.role === 'investor' ? <InvestorOnboarding /> : <BusinessOnboarding />;
}
