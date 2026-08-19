import { GoogleGenAI } from '@google/genai';

let client;
function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in the environment');
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const SCORE_SCHEMA = {
  type: 'object',
  properties: {
    scores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          businessId: { type: 'string', description: 'The id of the business being scored' },
          score: {
            type: 'integer',
            description: 'Compatibility score from 0 (poor fit) to 100 (excellent fit)',
          },
          explanation: {
            type: 'string',
            description: 'One or two sentence explanation an investor would find useful, written directly to the investor ("you").',
          },
        },
        required: ['businessId', 'score', 'explanation'],
      },
    },
  },
  required: ['scores'],
};

/**
 * Scores a batch of candidate businesses for a single investor in one API call.
 * Falls back to a simple rule-based score if the AI call fails, so the deck
 * never breaks just because the AI provider is down.
 */
export async function scoreBusinessesForInvestor(investor, businesses) {
  if (businesses.length === 0) return [];

  try {
    const ai = getClient();

    const investorSummary = {
      investmentRange: `$${investor.investmentMin} - $${investor.investmentMax}`,
      preferredNiches: investor.niches,
      preferredRegions: investor.geographicInterests,
      bio: investor.bio || '(no bio provided)',
    };

    const businessSummaries = businesses.map((b) => ({
      businessId: b._id.toString(),
      businessName: b.businessName,
      niche: b.niche,
      region: b.region,
      amountNeeded: b.amountNeeded,
      description: b.description,
    }));

    const prompt = `You are the matching engine for Rawabet, a platform that connects Lebanese diaspora investors with local Lebanese businesses seeking funding.

Given one investor's profile and a list of candidate businesses, score how well each business fits what this investor is looking for. Weigh niche alignment and geographic interest most heavily, but also use your judgement about the quality and credibility of the business description, and whether the funding amount is a reasonable fit for the investor's stated range (a business asking for noticeably more or less than the investor's range should score lower, but isn't an automatic disqualifier).

Investor profile:
${JSON.stringify(investorSummary, null, 2)}

Candidate businesses:
${JSON.stringify(businessSummaries, null, 2)}

Return a score (0-100) and explanation for every business listed above, in any order.`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: SCORE_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text);
    const scores = parsed.scores || [];
    const byId = new Map(scores.map((s) => [s.businessId, s]));

    return businesses.map((b) => {
      const s = byId.get(b._id.toString());
      return {
        businessId: b._id.toString(),
        score: s ? s.score : fallbackScore(investor, b),
        explanation: s ? s.explanation : 'Score estimated automatically (AI explanation unavailable).',
      };
    });
  } catch (err) {
    console.error('AI matching failed, falling back to rule-based scoring:', err.message);
    return businesses.map((b) => ({
      businessId: b._id.toString(),
      score: fallbackScore(investor, b),
      explanation: 'Score estimated automatically (AI matching temporarily unavailable).',
    }));
  }
}

function fallbackScore(investor, business) {
  let score = 40;
  if (investor.niches.includes(business.niche)) score += 30;
  if (investor.geographicInterests.includes(business.region)) score += 20;
  if (business.amountNeeded >= investor.investmentMin && business.amountNeeded <= investor.investmentMax) {
    score += 10;
  }
  return Math.min(score, 100);
}
