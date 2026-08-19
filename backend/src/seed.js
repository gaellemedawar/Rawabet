// Populates the database with sample investors and businesses for demoing
// the app. Safe to re-run — it clears out any previously seeded demo data
// first (anything with an @rawabet.demo email) before reinserting.
//
// Usage: npm run seed   (from backend/)
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import InvestorProfile from './models/InvestorProfile.js';
import BusinessProfile from './models/BusinessProfile.js';
import Swipe from './models/Swipe.js';
import Match from './models/Match.js';
import Message from './models/Message.js';

const DEMO_PASSWORD = 'Demo12345';
const UPLOAD_DIR = path.resolve('uploads');

const INVESTORS = [
  {
    email: 'layla.investor@rawabet.demo',
    fullName: 'Layla Haddad',
    bio: 'Chicago-based restaurateur looking to back Lebanese food brands with export potential.',
    investmentMin: 10000,
    investmentMax: 60000,
    niches: ['Food & Beverage', 'Retail & E-commerce'],
    geographicInterests: ['Beirut', 'Mount Lebanon'],
  },
  {
    email: 'karim.investor@rawabet.demo',
    fullName: 'Karim Abou Chacra',
    bio: 'Toronto software engineer who wants to fund tech and health startups tackling real problems back home.',
    investmentMin: 30000,
    investmentMax: 120000,
    niches: ['Technology', 'Healthcare'],
    geographicInterests: ['Beirut'],
  },
  {
    email: 'nadine.investor@rawabet.demo',
    fullName: 'Nadine Fares',
    bio: 'Paris-based hotel consultant, passionate about reviving South Lebanon\'s tourism sector.',
    investmentMin: 50000,
    investmentMax: 150000,
    niches: ['Tourism & Hospitality', 'Real Estate'],
    geographicInterests: ['South Lebanon', 'Beirut'],
  },
  {
    email: 'elie.investor@rawabet.demo',
    fullName: 'Elie Khoury',
    bio: 'Sydney small-business owner who wants to help artisans in his home village scale production.',
    investmentMin: 8000,
    investmentMax: 30000,
    niches: ['Manufacturing', 'Retail & E-commerce'],
    geographicInterests: ['North Lebanon'],
  },
  {
    email: 'maya.investor@rawabet.demo',
    fullName: 'Maya Saliba',
    bio: 'Sao Paulo-based, third-generation Lebanese-Brazilian, focused on agri-food ventures.',
    investmentMin: 5000,
    investmentMax: 40000,
    niches: ['Food & Beverage', 'Agriculture'],
    geographicInterests: ['Bekaa', 'Mount Lebanon'],
  },
];

const BUSINESSES = [
  {
    email: 'beitmouneh.business@rawabet.demo',
    businessName: 'Beit Mouneh',
    ownerName: 'Rania Abdallah',
    description:
      'Family-run pantry brand preserving Lebanese mouneh (pickles, jams, olive oil) using recipes passed down three generations. Expanding cold-storage capacity to supply supermarkets across Beirut.',
    niche: 'Food & Beverage',
    region: 'Mount Lebanon',
    amountNeeded: 15000,
  },
  {
    email: 'cedarbyte.business@rawabet.demo',
    businessName: 'Cedar Byte Robotics',
    ownerName: 'Tarek Nassar',
    description:
      'Builds affordable agricultural drones for precision irrigation, already piloted on three vineyards in the Bekaa Valley. Raising to manufacture the next 50 units.',
    niche: 'Technology',
    region: 'Beirut',
    amountNeeded: 60000,
  },
  {
    email: 'rawabettextiles.business@rawabet.demo',
    businessName: 'Rawabet Textiles',
    ownerName: 'Hala Zeidan',
    description:
      'Artisanal weaving cooperative employing twelve women in Tripoli, producing handloom textiles for export. Needs new looms to fulfil a European wholesale order.',
    niche: 'Manufacturing',
    region: 'North Lebanon',
    amountNeeded: 25000,
  },
  {
    email: 'seacedar.business@rawabet.demo',
    businessName: 'Sea & Cedar Retreats',
    ownerName: 'Joseph Rahme',
    description:
      'Eco-lodge project on the South Lebanon coast combining sustainable tourism with local employment. Seeking funding to complete phase one construction.',
    niche: 'Tourism & Hospitality',
    region: 'South Lebanon',
    amountNeeded: 90000,
  },
  {
    email: 'soukthreads.business@rawabet.demo',
    businessName: 'Souk Threads',
    ownerName: 'Dana Khalil',
    description:
      'Online marketplace connecting Lebanese artisans directly with diaspora buyers abroad, avoiding costly middlemen. Funding covers logistics and a mobile app.',
    niche: 'Retail & E-commerce',
    region: 'Beirut',
    amountNeeded: 12000,
  },
  {
    email: 'zaytounhealth.business@rawabet.demo',
    businessName: 'Zaytoun Health',
    ownerName: 'Dr. Samer Aoun',
    description:
      'Olive-oil-based skincare and wellness clinic sourcing directly from Bekaa farmers, blending traditional remedies with modern dermatology.',
    niche: 'Healthcare',
    region: 'Bekaa',
    amountNeeded: 40000,
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// A cedar tree or a coffee cup, alternating per business, rendered as a
// simple branded placeholder card (no real photos available for a demo).
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function placeholderSvg(businessName, niche, useCedar) {
  const icon = useCedar
    ? '<path d="M300 60 L340 130 H310 L350 190 H315 L360 250 H240 L285 190 H250 L290 130 H260 Z" fill="#1e6b4f"/><rect x="278" y="250" width="24" height="20" fill="#1e6b4f"/>'
    : '<path d="M260 150 H340 L322 220 H278 Z" fill="#1e6b4f"/><ellipse cx="300" cy="150" rx="42" ry="11" fill="#1e6b4f" opacity="0.85"/><ellipse cx="300" cy="235" rx="70" ry="14" fill="none" stroke="#1e6b4f" stroke-width="6"/><path d="M270 90c-10 10-10 20 0 30M330 90c10 10 10 20 0 30" stroke="#1e6b4f" stroke-width="6" stroke-linecap="round"/>';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#f7f5f0"/>
  <rect width="600" height="14" fill="#bf5b32"/>
  <rect y="386" width="600" height="14" fill="#c9932b"/>
  ${icon}
  <text x="300" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#1f2420">${escapeXml(businessName)}</text>
  <text x="300" y="350" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="18" fill="#6b7268">${escapeXml(niche)}</text>
</svg>`;
}

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function clearDemoData() {
  const demoUsers = await User.find({ email: { $regex: /@rawabet\.demo$/ } });
  const demoUserIds = demoUsers.map((u) => u._id);
  if (demoUserIds.length === 0) return;

  const investorProfiles = await InvestorProfile.find({ user: { $in: demoUserIds } });
  const businessProfiles = await BusinessProfile.find({ user: { $in: demoUserIds } });
  const investorProfileIds = investorProfiles.map((p) => p._id);
  const businessProfileIds = businessProfiles.map((p) => p._id);

  const matches = await Match.find({
    $or: [
      { investorProfile: { $in: investorProfileIds } },
      { businessProfile: { $in: businessProfileIds } },
    ],
  });
  const matchIds = matches.map((m) => m._id);

  await Message.deleteMany({ match: { $in: matchIds } });
  await Match.deleteMany({ _id: { $in: matchIds } });
  await Swipe.deleteMany({
    $or: [
      { investorProfile: { $in: investorProfileIds } },
      { businessProfile: { $in: businessProfileIds } },
    ],
  });
  await InvestorProfile.deleteMany({ user: { $in: demoUserIds } });
  await BusinessProfile.deleteMany({ user: { $in: demoUserIds } });
  await User.deleteMany({ _id: { $in: demoUserIds } });

  console.log(`Cleared ${demoUserIds.length} previously seeded demo accounts.`);
}

async function seed() {
  await connectDB();
  ensureUploadDir();
  await clearDemoData();

  for (const inv of INVESTORS) {
    const user = await User.create({ email: inv.email, password: DEMO_PASSWORD, role: 'investor', onboardingComplete: true });
    await InvestorProfile.create({
      user: user._id,
      fullName: inv.fullName,
      bio: inv.bio,
      investmentMin: inv.investmentMin,
      investmentMax: inv.investmentMax,
      niches: inv.niches,
      geographicInterests: inv.geographicInterests,
    });
  }
  console.log(`Seeded ${INVESTORS.length} investors.`);

  for (const [i, biz] of BUSINESSES.entries()) {
    const user = await User.create({ email: biz.email, password: DEMO_PASSWORD, role: 'business', onboardingComplete: true });

    const filename = `${slugify(biz.businessName)}.svg`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), placeholderSvg(biz.businessName, biz.niche, i % 2 === 0));

    await BusinessProfile.create({
      user: user._id,
      businessName: biz.businessName,
      ownerName: biz.ownerName,
      description: biz.description,
      niche: biz.niche,
      region: biz.region,
      amountNeeded: biz.amountNeeded,
      images: [`/uploads/${filename}`],
    });
  }
  console.log(`Seeded ${BUSINESSES.length} businesses.`);

  console.log('\nDemo login password for every seeded account:', DEMO_PASSWORD);
  console.log('\nInvestor accounts:');
  INVESTORS.forEach((i) => console.log(`  ${i.email}`));
  console.log('\nBusiness accounts:');
  BUSINESSES.forEach((b) => console.log(`  ${b.email}`));

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
