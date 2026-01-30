import { Team, FinancialState, PlayoffResult } from '../data/types';

// Economic constants - based on real NBA economics
export const SALARY_CAP = 140;           // $140M soft cap
export const LUXURY_TAX_THRESHOLD = 170; // $170M luxury tax line
export const SALARY_FLOOR = 110;         // $110M minimum payroll
export const REPEATER_TAX_YEARS = 3;     // Consecutive years trigger repeater

/**
 * Calculate luxury tax owed based on payroll
 * Uses NBA-style progressive tax brackets
 *
 * This teaches: Risk has different costs depending on your situation.
 * Over-spending isn't always bad - it's about whether your system can absorb the cost.
 */
export function calculateLuxuryTax(
  payroll: number,
  consecutiveTaxYears: number
): number {
  if (payroll <= LUXURY_TAX_THRESHOLD) return 0;

  const excess = payroll - LUXURY_TAX_THRESHOLD;
  let tax = 0;

  // Progressive tax brackets - risk escalates non-linearly
  const brackets = [
    { max: 5, rate: 1.50 },   // $1.50 per $1 for first $5M over
    { max: 10, rate: 1.75 },  // $1.75 per $1 for next $5M
    { max: 15, rate: 2.50 },  // $2.50 per $1 for next $5M
    { max: 20, rate: 3.25 },  // $3.25 per $1 for next $5M
    { max: Infinity, rate: 4.25 }, // $4.25 per $1 beyond $20M
  ];

  let remaining = excess;
  let previousMax = 0;

  for (const bracket of brackets) {
    const amountInBracket = Math.min(remaining, bracket.max - previousMax);
    if (amountInBracket <= 0) break;
    tax += amountInBracket * bracket.rate;
    remaining -= amountInBracket;
    previousMax = bracket.max;
  }

  // Repeater tax penalty (additional 50% if 3+ consecutive years)
  // This teaches: Repeated aggressive behavior compounds consequences
  if (consecutiveTaxYears >= REPEATER_TAX_YEARS) {
    tax *= 1.5;
  }

  return Math.round(tax * 10) / 10;
}

/**
 * Calculate salary floor penalty
 * Teams that don't spend enough must pay the difference to players
 */
export function calculateFloorPenalty(payroll: number): number {
  if (payroll >= SALARY_FLOOR) return 0;
  return SALARY_FLOOR - payroll;
}

/**
 * Calculate team revenue based on performance and market factors
 *
 * Key insight: Same win total generates different revenue based on context
 * This teaches why the same strategy has different outcomes for different teams
 */
export function calculateRevenue(
  team: Team,
  wins: number,
  playoffRound: number, // 0 = missed, 1 = first round, etc.
  isChampion: boolean
): number {
  let revenue = 80; // Base revenue ($80M)

  // Market size bonus - big markets have more margin for error
  if (team.marketSize === 'large') revenue += 40;
  else if (team.marketSize === 'medium') revenue += 20;
  else revenue += 5;

  // Win bonus ($0.5M per win)
  revenue += wins * 0.5;

  // Playoff revenue - exponential rewards for going deeper
  const playoffBonus = [0, 5, 10, 20, 35];
  revenue += playoffBonus[Math.min(playoffRound, 4)];

  // Championship bonus
  if (isChampion) revenue += 25;

  // Fan engagement bonus
  revenue += team.fanbase * 0.3;

  // Prestige bonus
  revenue += team.prestige * 0.2;

  return Math.round(revenue);
}

/**
 * Calculate operating expenses
 */
export function calculateExpenses(
  payroll: number,
  luxuryTax: number,
  floorPenalty: number
): number {
  const baseOperations = 50; // $50M operating costs
  return payroll + luxuryTax + floorPenalty + baseOperations;
}

/**
 * Generate full financial report for end of season
 */
export function generateFinancialReport(
  team: Team,
  wins: number,
  playoffRound: number,
  isChampion: boolean,
  consecutiveTaxYears: number
): FinancialState {
  const payroll = team.totalSalary;
  const luxuryTax = calculateLuxuryTax(payroll, consecutiveTaxYears);
  const floorPenalty = calculateFloorPenalty(payroll);
  const revenue = calculateRevenue(team, wins, playoffRound, isChampion);
  const expenses = calculateExpenses(payroll, luxuryTax, floorPenalty);

  return {
    salaryCap: SALARY_CAP,
    luxuryTaxThreshold: LUXURY_TAX_THRESHOLD,
    salaryFloor: SALARY_FLOOR,
    currentPayroll: payroll,
    luxuryTaxOwed: luxuryTax,
    revenue,
    expenses,
    profit: revenue - expenses,
    consecutiveTaxYears: luxuryTax > 0 ? consecutiveTaxYears + 1 : 0,
  };
}

/**
 * Determine if a financial decision is "rational" given team context
 *
 * This is the core lesson: The same aggressive move can be rational for one team
 * and irrational for another, based on their system's ability to absorb risk.
 */
export function isRationalAggression(
  team: Team,
  proposedAction: 'luxury_tax_spend' | 'big_contract' | 'trade_assets',
  actionCost: number
): { rational: boolean; reason: string; riskLevel: 'low' | 'medium' | 'high' } {

  // Calculate team's risk tolerance based on context
  const marketBuffer = team.marketSize === 'large' ? 30 : team.marketSize === 'medium' ? 15 : 0;
  const prestigeBuffer = team.prestige * 0.2;
  const fanPatienceBuffer = team.fanbase > 70 ? 10 : team.fanbase < 40 ? -10 : 0;

  const totalBuffer = marketBuffer + prestigeBuffer + fanPatienceBuffer;

  // Different team contexts have different risk tolerances
  let contextMultiplier = 1.0;
  let contextReason = '';

  switch (team.contextType) {
    case 'legacy_power':
      contextMultiplier = 1.2; // Can afford more risk due to brand
      contextReason = 'Legacy franchises have brand equity to absorb failures';
      break;
    case 'small_market_reset':
      contextMultiplier = 0.7; // Less margin for error
      contextReason = 'Small markets have less revenue buffer for mistakes';
      break;
    case 'revenue_sensitive':
      contextMultiplier = 0.5; // Very risk-averse
      contextReason = 'Revenue-sensitive teams face harsh consequences for failure';
      break;
    case 'cash_rich_expansion':
      contextMultiplier = 1.5; // Can take big swings
      contextReason = 'Well-funded teams can absorb aggressive moves';
      break;
    case 'star_dependent':
      contextMultiplier = 1.1; // Must take risks to keep star happy
      contextReason = 'Star-dependent teams often must take risks to compete';
      break;
  }

  const effectiveBuffer = totalBuffer * contextMultiplier;
  const riskThreshold = effectiveBuffer + 20; // Base threshold

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (actionCost > riskThreshold * 1.5) riskLevel = 'high';
  else if (actionCost > riskThreshold) riskLevel = 'medium';

  const rational = actionCost <= riskThreshold ||
    (riskLevel === 'medium' && team.wins > 45) || // Contenders can justify medium risk
    (team.contextType === 'cash_rich_expansion'); // Rich teams always have room

  return {
    rational,
    reason: rational
      ? `This risk level is appropriate for your team context. ${contextReason}`
      : `This level of risk may be irrational given your team's ability to absorb failure. ${contextReason}`,
    riskLevel
  };
}

/**
 * Get playoff round number from result
 */
export function getPlayoffRoundFromResult(result: PlayoffResult): number {
  const roundMap: Record<PlayoffResult, number> = {
    'missed': 0,
    'first_round': 1,
    'second_round': 2,
    'conference_finals': 3,
    'finals': 4,
    'champion': 4,
  };
  return roundMap[result] || 0;
}

/**
 * Analyze team's financial health
 */
export function analyzeFinancialHealth(financials: FinancialState): {
  status: 'healthy' | 'strained' | 'critical';
  message: string;
} {
  if (financials.profit > 20) {
    return { status: 'healthy', message: 'Strong financial position with room for aggressive moves' };
  } else if (financials.profit > 0) {
    return { status: 'healthy', message: 'Solid finances with moderate flexibility' };
  } else if (financials.profit > -20) {
    return { status: 'strained', message: 'Operating at a loss - consider reducing payroll' };
  } else {
    return { status: 'critical', message: 'Significant losses - aggressive cost-cutting needed' };
  }
}
