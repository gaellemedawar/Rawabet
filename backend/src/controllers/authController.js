import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export async function register(req, res) {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'email, password and role are required' });
  }
  if (!['investor', 'business'].includes(role)) {
    return res.status(400).json({ message: 'role must be "investor" or "business"' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({ email, password, role });
  const token = generateToken(user._id, user.role);

  res.status(201).json({
    token,
    user: { id: user._id, email: user.email, role: user.role, onboardingComplete: user.onboardingComplete },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id, user.role);
  res.json({
    token,
    user: { id: user._id, email: user.email, role: user.role, onboardingComplete: user.onboardingComplete },
  });
}

export async function me(req, res) {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      onboardingComplete: req.user.onboardingComplete,
    },
  });
}
