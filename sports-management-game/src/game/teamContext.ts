import { TeamContext, TeamContextType, Strategy, StrategyType } from '../data/types';

export const TEAM_CONTEXTS: Record<TeamContextType, TeamContext> = {
  legacy_power: {
    type: 'legacy_power',
    label: 'Legacy Power',
    description: 'Historic franchise with massive fanbase, high expectations, and significant brand value. Fans expect contention every year.',
    fanPatience: 3,
    mediaPressure: 1.5,
    revenueVolatility: 0.3,
    ownershipRiskTolerance: 0.7,
    brandValueAtRisk: 0.9,
  },
  small_market_reset: {
    type: 'small_market_reset',
    label: 'Small Market Reset',
    description: 'Smaller market team building through the draft. Patient fanbase but limited free agency appeal.',
    fanPatience: 7,
    mediaPressure: 0.6,
    revenueVolatility: 0.7,
    ownershipRiskTolerance: 0.4,
    brandValueAtRisk: 0.3,
  },
  revenue_sensitive: {
    type: 'revenue_sensitive',
    label: 'Revenue Sensitive',
    description: 'Team where financial performance directly impacts decisions. Must balance competitiveness with fiscal responsibility.',
    fanPatience: 5,
    mediaPressure: 0.8,
    revenueVolatility: 0.9,
    ownershipRiskTolerance: 0.3,
    brandValueAtRisk: 0.5,
  },
  cash_rich_expansion: {
    type: 'cash_rich_expansion',
    label: 'Cash Rich Expansion',
    description: 'Well-funded franchise looking to establish identity. Money is available but must be spent wisely.',
    fanPatience: 6,
    mediaPressure: 0.7,
    revenueVolatility: 0.4,
    ownershipRiskTolerance: 0.8,
    brandValueAtRisk: 0.2,
  },
  star_dependent: {
    type: 'star_dependent',
    label: 'Star Dependent',
    description: 'Franchise built around one or two superstars. Keep the star happy or risk losing everything.',
    fanPatience: 4,
    mediaPressure: 1.2,
    revenueVolatility: 0.6,
    ownershipRiskTolerance: 0.6,
    brandValueAtRisk: 0.7,
  },
};

export const STRATEGIES: Record<StrategyType, Strategy> = {
  stability_first: {
    type: 'stability_first',
    label: 'Stability First',
    description: 'Prioritize consistency and protect the downside. Focus on youth development and smart draft picks. Low risk, steady growth.',
    tradeRisk: 0.3,
    draftPickProtection: true,
    outcomeVariance: 0.7,
    championshipBonus: 0.05,
    winNowOrientation: 0.3,
    youthDevelopment: 0.8,
  },
  aggressive_push: {
    type: 'aggressive_push',
    label: 'Aggressive Push',
    description: 'Trade flexibility for immediate improvement. Medium volatility approach balancing win-now with some future considerations.',
    tradeRisk: 0.6,
    draftPickProtection: false,
    outcomeVariance: 1.2,
    championshipBonus: 0.15,
    winNowOrientation: 0.7,
    youthDevelopment: 0.4,
  },
  boom_bust_swing: {
    type: 'boom_bust_swing',
    label: 'Boom/Bust Swing',
    description: 'All-in approach with maximum championship upside but severe collapse risk. Trade everything for a title shot.',
    tradeRisk: 1.0,
    draftPickProtection: false,
    outcomeVariance: 2.0,
    championshipBonus: 0.30,
    winNowOrientation: 1.0,
    youthDevelopment: 0.1,
  },
};

export function getContextCompatibility(context: TeamContextType, strategy: StrategyType): number {
  // Derived from CONTEXT_RISK_EXPECTATIONS so this can never drift away from
  // what the end screen actually scores. The previous hand-written table had
  // small_market_reset rating boom_bust_swing 0.3 — its worst option — for the
  // one context the game tells you to swing with.
  const byBand: Record<RiskBand, Record<StrategyType, number>> = {
    high:   { stability_first: 0.3, aggressive_push: 0.7, boom_bust_swing: 0.9 },
    medium: { stability_first: 0.6, aggressive_push: 0.9, boom_bust_swing: 0.6 },
    low:    { stability_first: 0.9, aggressive_push: 0.5, boom_bust_swing: 0.2 },
  };
  return byBand[CONTEXT_RISK_EXPECTATIONS[context]][strategy];
}

export function getDifficultyRating(context: TeamContextType): number {
  const difficulty: Record<TeamContextType, number> = {
    legacy_power: 3,
    small_market_reset: 2,
    revenue_sensitive: 4,
    cash_rich_expansion: 1,
    star_dependent: 3,
  };
  return difficulty[context];
}

/* ---------------------------------------------------------------------------
 * What risk level is CORRECT for each context.
 *
 * This is the lesson the whole simulation exists to teach, so it lives in one
 * place and every screen reads it from here. It used to be duplicated: the end
 * screen scored against a private copy, the onboarding narrated a second copy,
 * and the dashboard tried to re-derive it from `ownershipRiskTolerance` — a
 * different quantity on a different scale. The dashboard lost that bet and told
 * every team to play it safe, including the two the scoring rewards for
 * swinging, which is a 32-point swing on a 100-point score.
 *
 * Note this is deliberately NOT ownershipRiskTolerance. That is how much
 * variance the OWNER will absorb. This is what the SITUATION calls for, and the
 * two come apart on purpose — a small-market rebuild has a cautious owner and
 * every reason to take big swings, which is the point of rational aggression.
 * ------------------------------------------------------------------------- */
export type RiskBand = 'high' | 'medium' | 'low';

export const CONTEXT_RISK_EXPECTATIONS: Record<TeamContextType, RiskBand> = {
  small_market_reset: 'high',
  cash_rich_expansion: 'high',
  legacy_power: 'medium',
  star_dependent: 'medium',
  revenue_sensitive: 'low',
};

export function getRiskExpectation(context: TeamContextType): RiskBand {
  return CONTEXT_RISK_EXPECTATIONS[context];
}

/** Short badge text. Same words wherever the band is shown. */
export function riskBandLabel(band: RiskBand): string {
  return band === 'high' ? 'SHOULD Take Big Risks'
    : band === 'medium' ? 'CAN Take Calculated Risks'
    : 'AVOID High-Risk Plays';
}

/** The sentence the dashboard shows while decisions are still being made. */
export function riskBandCoaching(band: RiskBand): string {
  return band === 'high'
    ? 'Your team SHOULD take big risks. Are you being aggressive enough?'
    : band === 'medium'
    ? 'Moderate risk is appropriate. Balance aggression with stability.'
    : 'Your team should AVOID high risk. Playing it safe is the smart move.';
}
