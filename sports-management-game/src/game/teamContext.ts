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
  const compatibility: Record<TeamContextType, Record<StrategyType, number>> = {
    legacy_power: { stability_first: 0.5, aggressive_push: 0.9, boom_bust_swing: 0.7 },
    small_market_reset: { stability_first: 0.9, aggressive_push: 0.5, boom_bust_swing: 0.3 },
    revenue_sensitive: { stability_first: 0.8, aggressive_push: 0.5, boom_bust_swing: 0.2 },
    cash_rich_expansion: { stability_first: 0.6, aggressive_push: 0.8, boom_bust_swing: 0.6 },
    star_dependent: { stability_first: 0.4, aggressive_push: 0.8, boom_bust_swing: 0.9 },
  };
  return compatibility[context][strategy];
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
