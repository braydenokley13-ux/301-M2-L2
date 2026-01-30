import { Player, Team, TradeProposal, DraftPick, Position } from '../data/types';
import { SALARY_CAP } from './economics';

/**
 * TRADE SYSTEM PHILOSOPHY:
 *
 * In real sports, star players are worth exponentially more than role players.
 * You can NOT trade 5 average players for one superstar - it simply doesn't work.
 *
 * This system uses TIERS to reflect this reality:
 * - SUPERSTAR (90+ OVR): Franchise-defining players. Worth more than any combination of non-stars.
 * - STAR (85-89 OVR): All-star caliber. Require star-level return or massive asset hauls.
 * - QUALITY STARTER (78-84 OVR): Solid contributors. Can be combined to get stars with picks.
 * - ROLE PLAYER (70-77 OVR): Useful pieces. Many needed to equal one quality starter.
 * - FILLER (< 70 OVR): Minimal trade value. Often negative value due to salary.
 *
 * KEY RULE: Players outside the tier can't reach the tier above no matter the quantity.
 * 5 role players will NEVER equal a star's value.
 */

// ========================
// TIER DEFINITIONS
// ========================

type PlayerTier = 'superstar' | 'star' | 'quality_starter' | 'role_player' | 'filler';

function getPlayerTier(player: Player): PlayerTier {
  if (player.overallRating >= 90) return 'superstar';
  if (player.overallRating >= 85 || player.isStar) return 'star';
  if (player.overallRating >= 78) return 'quality_starter';
  if (player.overallRating >= 70) return 'role_player';
  return 'filler';
}

// Base values by tier - note the exponential gaps
const TIER_BASE_VALUES: Record<PlayerTier, number> = {
  superstar: 500,       // Franchise cornerstone
  star: 250,            // All-star caliber
  quality_starter: 80,  // Solid starter
  role_player: 25,      // Bench/rotation piece
  filler: 5,            // Minimal value
};

// Maximum possible value from combining players of a lower tier
// This prevents trading multiple lower-tier players for higher-tier ones
const TIER_CEILINGS: Record<PlayerTier, number> = {
  superstar: Infinity,  // No ceiling
  star: 400,            // Can't reach superstar value (500) by combining stars
  quality_starter: 180, // Can't reach star value (250) by combining starters
  role_player: 60,      // Can't reach quality starter value (80) by combining role players
  filler: 15,           // Can't reach role player value (25) by combining fillers
};

// ========================
// PLAYER VALUE CALCULATION
// ========================

/**
 * Calculate individual player value based on tier + modifiers
 */
export function calculatePlayerValue(player: Player): number {
  const tier = getPlayerTier(player);
  let baseValue = TIER_BASE_VALUES[tier];

  // Rating bonus within tier
  const tierFloor = tier === 'superstar' ? 90 : tier === 'star' ? 85 : tier === 'quality_starter' ? 78 : tier === 'role_player' ? 70 : 60;
  const ratingBonus = (player.overallRating - tierFloor) * (tier === 'superstar' ? 20 : tier === 'star' ? 15 : 5);

  // Age factor - young players worth more, old players worth less
  let ageFactor = 1.0;
  if (player.age <= 23) ageFactor = 1.4;
  else if (player.age <= 26) ageFactor = 1.2;
  else if (player.age <= 28) ageFactor = 1.0;
  else if (player.age <= 31) ageFactor = 0.8;
  else if (player.age <= 33) ageFactor = 0.5;
  else ageFactor = 0.3;

  // Potential bonus (especially important for young players)
  const potentialGap = Math.max(0, player.potential - player.overallRating);
  const potentialBonus = potentialGap * (player.age <= 25 ? 3 : 1);

  // Contract considerations
  let contractFactor = 1.0;
  if (player.contractYears === 1) contractFactor = 0.85; // Expiring - flight risk
  else if (player.contractYears >= 4 && player.age > 30) contractFactor = 0.7; // Long deal on aging player
  else if (player.contractYears >= 2 && player.contractYears <= 3) contractFactor = 1.1; // Ideal control

  // Salary burden for overpaid players
  const expectedSalary = Math.max(5, (player.overallRating - 60) * 1.2);
  const salaryPenalty = player.salary > expectedSalary ? (player.salary - expectedSalary) * 2 : 0;

  const finalValue = Math.round((baseValue + ratingBonus + potentialBonus) * ageFactor * contractFactor - salaryPenalty);

  return Math.max(1, finalValue); // Minimum value of 1
}

/**
 * Calculate total value of multiple players WITH TIER CEILING ENFORCEMENT
 *
 * This is the key innovation: players are grouped by tier, and each tier's
 * total contribution is CAPPED. You can't overcome this by adding more players.
 */
function calculatePackageValue(players: Player[]): number {
  if (players.length === 0) return 0;

  // Group players by tier
  const byTier: Record<PlayerTier, Player[]> = {
    superstar: [],
    star: [],
    quality_starter: [],
    role_player: [],
    filler: [],
  };

  players.forEach(p => {
    byTier[getPlayerTier(p)].push(p);
  });

  let totalValue = 0;

  // Calculate each tier's contribution with ceiling
  for (const tier of ['superstar', 'star', 'quality_starter', 'role_player', 'filler'] as PlayerTier[]) {
    const tierPlayers = byTier[tier];
    if (tierPlayers.length === 0) continue;

    // Sort by value within tier (best first)
    tierPlayers.sort((a, b) => calculatePlayerValue(b) - calculatePlayerValue(a));

    // Apply diminishing returns within tier
    let tierValue = 0;
    const diminishingFactors = [1.0, 0.6, 0.35, 0.2, 0.1]; // Very aggressive diminishing returns

    tierPlayers.forEach((player, idx) => {
      const factor = diminishingFactors[Math.min(idx, diminishingFactors.length - 1)];
      tierValue += calculatePlayerValue(player) * factor;
    });

    // Apply tier ceiling
    const cappedValue = Math.min(tierValue, TIER_CEILINGS[tier]);
    totalValue += cappedValue;
  }

  // Roster dump penalty - offering too many players is a red flag
  if (players.length > 3) {
    const dumpPenalty = (players.length - 3) * 15;
    totalValue = Math.max(1, totalValue - dumpPenalty);
  }

  return Math.round(totalValue);
}

// ========================
// DRAFT PICK VALUES
// ========================

export function calculateDraftPickValue(pick: DraftPick, projectedPosition?: number): number {
  const pos = projectedPosition || pick.projectedPosition || 15;

  // Top picks are extremely valuable
  let baseValue: number;
  if (pos <= 3) baseValue = 200 + (4 - pos) * 50; // #1 = 350, #2 = 300, #3 = 250
  else if (pos <= 5) baseValue = 150;
  else if (pos <= 10) baseValue = 100;
  else if (pos <= 14) baseValue = 60;
  else baseValue = 30; // Late first rounders

  // Second round picks worth much less
  const roundMultiplier = pick.round === 1 ? 1.0 : 0.2;

  // Future picks slightly discounted
  const yearDiscount = pick.year > 1 ? 0.9 : 1.0;

  return Math.round(baseValue * roundMultiplier * yearDiscount);
}

// ========================
// TRADE EVALUATION
// ========================

/**
 * Position fit bonus/penalty
 */
function calculatePositionFit(team: Team, receivingPlayers: Player[]): number {
  let fitScore = 0;
  const positionCount: Record<Position, number> = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 };

  team.roster.forEach(p => positionCount[p.position]++);

  receivingPlayers.forEach(player => {
    if (positionCount[player.position] < 2) {
      fitScore += 15; // Bonus for filling a need
    } else if (positionCount[player.position] >= 4) {
      fitScore -= 10; // Penalty for roster redundancy
    }
  });

  return fitScore;
}

/**
 * Calculate the risk level of a trade
 */
export function calculateTradeRisk(
  playersOffered: Player[],
  playersRequested: Player[],
  picksOffered: DraftPick[],
  picksRequested: DraftPick[]
): { riskLevel: 'low' | 'medium' | 'high'; volatilityImpact: number; explanation: string } {
  let riskScore = 0;
  let explanations: string[] = [];

  // Trading stars = franchise-altering risk
  const starsTraded = playersOffered.filter(p => getPlayerTier(p) === 'star' || getPlayerTier(p) === 'superstar');
  if (starsTraded.length > 0) {
    riskScore += 40 * starsTraded.length;
    explanations.push('Trading star-caliber players is a franchise-defining decision');
  }

  // Acquiring unproven young players = high variance
  const youngUnproven = playersRequested.filter(p => p.age <= 23 && p.overallRating < 78);
  if (youngUnproven.length > 0) {
    riskScore += 15 * youngUnproven.length;
    explanations.push('Young unproven players add uncertainty');
  }

  // Trading first round picks = limiting future options
  const firstRounders = picksOffered.filter(p => p.round === 1);
  if (firstRounders.length > 0) {
    riskScore += 25 * firstRounders.length;
    explanations.push('Trading first-round picks limits future flexibility');
  }

  // Receiving picks instead of players = betting on unknown future
  if (picksRequested.length > playersRequested.length) {
    riskScore += 20;
    explanations.push('Acquiring picks over proven players increases volatility');
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 60) riskLevel = 'high';
  else if (riskScore >= 30) riskLevel = 'medium';

  return {
    riskLevel,
    volatilityImpact: riskScore,
    explanation: explanations.length > 0
      ? explanations.join('. ')
      : 'Standard trade with predictable outcomes'
  };
}

/**
 * Validate salary matching rules
 */
export function validateTradeSalary(
  fromTeam: Team,
  toTeam: Team,
  playersOffered: Player[],
  playersRequested: Player[],
  salaryCap: number = SALARY_CAP,
): { valid: boolean; reason: string | null } {
  const outgoingSalary = playersOffered.reduce((sum, p) => sum + p.salary, 0);
  const incomingSalary = playersRequested.reduce((sum, p) => sum + p.salary, 0);

  // Over-cap teams must match within 125% + $100K
  if (fromTeam.totalSalary > salaryCap) {
    const maxIncoming = outgoingSalary * 1.25 + 0.1;
    if (incomingSalary > maxIncoming) {
      return {
        valid: false,
        reason: `Over cap teams can only receive $${Math.round(maxIncoming)}M (125% of $${outgoingSalary.toFixed(1)}M outgoing)`
      };
    }
  }

  // Under-cap teams can absorb up to their cap space
  if (fromTeam.totalSalary <= salaryCap) {
    const capSpace = salaryCap - fromTeam.totalSalary;
    if (incomingSalary > outgoingSalary + capSpace) {
      return {
        valid: false,
        reason: `Insufficient cap space. Need $${(incomingSalary - outgoingSalary - capSpace).toFixed(1)}M more.`
      };
    }
  }

  return { valid: true, reason: null };
}

/**
 * Main trade evaluation - compares package values
 */
export function evaluateTrade(
  fromTeam: Team,
  toTeam: Team,
  playersOffered: Player[],
  playersRequested: Player[],
  picksOffered: DraftPick[],
  picksRequested: DraftPick[],
): { fairnessScore: number; fromValue: number; toValue: number; analysis: string; riskAssessment: ReturnType<typeof calculateTradeRisk> } {

  // Calculate package values (with tier ceilings applied)
  const offeredPlayerValue = calculatePackageValue(playersOffered);
  const requestedPlayerValue = calculatePackageValue(playersRequested);

  // Draft pick values
  const offeredPickValue = picksOffered.reduce((sum, p) => sum + calculateDraftPickValue(p), 0);
  const requestedPickValue = picksRequested.reduce((sum, p) => sum + calculateDraftPickValue(p), 0);

  // Position fit bonus for AI team
  const positionFitForAI = calculatePositionFit(toTeam, playersOffered);

  // Total values
  const fromValue = Math.round(offeredPlayerValue + offeredPickValue + positionFitForAI);
  const toValue = Math.round(requestedPlayerValue + requestedPickValue);

  // Calculate fairness as percentage difference
  const diff = fromValue - toValue;
  const avgValue = Math.max(1, (fromValue + toValue) / 2);
  const fairnessScore = Math.round((diff / avgValue) * 100);

  // Risk assessment
  const riskAssessment = calculateTradeRisk(playersOffered, playersRequested, picksOffered, picksRequested);

  // Generate analysis
  const analysis = generateTradeAnalysis(
    fairnessScore,
    fromTeam,
    toTeam,
    playersOffered,
    playersRequested,
    fromValue,
    toValue
  );

  return { fairnessScore, fromValue, toValue, analysis, riskAssessment };
}

function generateTradeAnalysis(
  fairnessScore: number,
  fromTeam: Team,
  toTeam: Team,
  playersOffered: Player[],
  playersRequested: Player[],
  fromValue: number,
  toValue: number
): string {
  const messages: string[] = [];

  // Main fairness message
  if (Math.abs(fairnessScore) <= 15) {
    messages.push('Fair trade for both sides.');
  } else if (fairnessScore > 15 && fairnessScore <= 40) {
    messages.push(`${fromTeam.city} is offering a good package.`);
  } else if (fairnessScore > 40) {
    messages.push(`${fromTeam.city} is overpaying significantly. Likely to be accepted.`);
  } else if (fairnessScore < -15 && fairnessScore >= -40) {
    messages.push(`${toTeam.city} would need more value to accept.`);
  } else {
    messages.push(`This trade heavily favors ${fromTeam.city}. Will not be accepted.`);
  }

  // Tier mismatch warnings
  const requestedStars = playersRequested.filter(p => getPlayerTier(p) === 'star' || getPlayerTier(p) === 'superstar');
  const offeredStars = playersOffered.filter(p => getPlayerTier(p) === 'star' || getPlayerTier(p) === 'superstar');

  if (requestedStars.length > 0 && offeredStars.length === 0) {
    const nonStarValue = calculatePackageValue(playersOffered.filter(p => getPlayerTier(p) !== 'star' && getPlayerTier(p) !== 'superstar'));
    const starValue = calculatePackageValue(requestedStars);

    if (nonStarValue < starValue * 0.7) {
      messages.push(`Star players require star-level returns. Role players alone cannot match their value.`);
    }
  }

  // Quantity warning
  if (playersOffered.length >= 4) {
    messages.push('Offering too many players triggers diminishing returns and roster dump penalties.');
  }

  // Value breakdown for clarity
  messages.push(`Value: Offering ${fromValue} for ${toValue}.`);

  return messages.join(' ');
}

/**
 * Would AI accept this trade?
 */
export function wouldAIAcceptTrade(
  fairnessScore: number,
  aiTeam: Team,
  difficulty: 'easy' | 'medium' | 'hard',
): boolean {
  // AI needs the trade to favor them (or be close to fair)
  const threshold = difficulty === 'easy' ? -20 : difficulty === 'medium' ? -8 : 0;
  return fairnessScore >= threshold;
}

/**
 * AI generates trade proposals (focuses on quality)
 */
export function generateAITradeProposal(
  aiTeam: Team,
  targetTeam: Team,
  allTeams: Team[],
): TradeProposal | null {
  // AI targets quality starters, rarely stars
  const targetPlayers = targetTeam.roster
    .filter(p => {
      const tier = getPlayerTier(p);
      // Never target superstars, rarely target stars
      if (tier === 'superstar') return false;
      if (tier === 'star') return Math.random() < 0.05;
      return tier === 'quality_starter' || (tier === 'role_player' && p.age <= 26);
    })
    .sort((a, b) => calculatePlayerValue(b) - calculatePlayerValue(a));

  if (targetPlayers.length === 0) return null;

  const wanted = targetPlayers[0];
  const wantedValue = calculatePlayerValue(wanted);

  // AI offers players of similar tier (quality for quality)
  const aiTradeable = aiTeam.roster
    .filter(p => {
      const tier = getPlayerTier(p);
      // Don't trade stars for non-stars
      if (tier === 'superstar' || tier === 'star') return false;
      // Only offer reasonable quality
      return p.overallRating >= 68;
    })
    .sort((a, b) => calculatePlayerValue(b) - calculatePlayerValue(a));

  let offeredPlayers: Player[] = [];
  let offeredValue = 0;

  // Try to match with 1-2 players max
  for (const player of aiTradeable) {
    if (offeredPlayers.length >= 2) break;
    if (offeredValue >= wantedValue * 0.95) break;

    offeredPlayers.push(player);
    offeredValue = calculatePackageValue(offeredPlayers);
  }

  // Must offer reasonable value
  if (offeredValue < wantedValue * 0.7) return null;

  // Add pick if needed
  const picksOffered: DraftPick[] = [];
  if (offeredValue < wantedValue * 0.9 && aiTeam.draftPicks.length > 2) {
    const pick = aiTeam.draftPicks.find(p => p.round === 2) || aiTeam.draftPicks[0];
    if (pick) picksOffered.push(pick);
  }

  return {
    id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    fromTeamId: aiTeam.id,
    toTeamId: targetTeam.id,
    playersOffered: offeredPlayers.map(p => p.id),
    playersRequested: [wanted.id],
    picksOffered: picksOffered.map(p => p.id),
    picksRequested: [],
    status: 'pending',
    fairnessScore: 0,
  };
}

/**
 * Execute a completed trade
 */
export function executeTrade(
  teams: Team[],
  proposal: TradeProposal,
  allPlayers: Player[],
): { updatedTeams: Team[]; updatedPlayers: Player[] } {
  const updatedPlayers = allPlayers.map(p => {
    if (proposal.playersOffered.includes(p.id)) {
      return { ...p, teamId: proposal.toTeamId };
    }
    if (proposal.playersRequested.includes(p.id)) {
      return { ...p, teamId: proposal.fromTeamId };
    }
    return p;
  });

  const updatedTeams = teams.map(t => {
    const teamPlayers = updatedPlayers.filter(p => p.teamId === t.id);
    let updatedPicks = [...t.draftPicks];

    if (t.id === proposal.fromTeamId) {
      updatedPicks = updatedPicks.filter(p => !proposal.picksOffered.includes(p.id));
      const receivedPicks = teams.flatMap(tm => tm.draftPicks).filter(p => proposal.picksRequested.includes(p.id));
      updatedPicks.push(...receivedPicks.map(p => ({ ...p, currentTeamId: t.id })));
    }
    if (t.id === proposal.toTeamId) {
      updatedPicks = updatedPicks.filter(p => !proposal.picksRequested.includes(p.id));
      const receivedPicks = teams.flatMap(tm => tm.draftPicks).filter(p => proposal.picksOffered.includes(p.id));
      updatedPicks.push(...receivedPicks.map(p => ({ ...p, currentTeamId: t.id })));
    }

    return {
      ...t,
      roster: teamPlayers,
      totalSalary: teamPlayers.reduce((sum, p) => sum + p.salary, 0),
      draftPicks: updatedPicks,
    };
  });

  return { updatedTeams, updatedPlayers };
}

// Export tier function for UI use
export { getPlayerTier, type PlayerTier };
