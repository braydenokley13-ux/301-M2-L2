import { Player, Team, TradeProposal, DraftPick, Position } from '../data/types';
import { SALARY_CAP } from './economics';

/**
 * Calculate base player value
 */
export function calculatePlayerValue(player: Player): number {
  const ratingValue = player.overallRating * 2;
  const potentialBonus = Math.max(0, (player.potential - player.overallRating)) * 1.5;
  const ageFactor = player.age <= 25 ? 1.3 : player.age <= 28 ? 1.1 : player.age <= 32 ? 0.9 : 0.6;
  const contractFactor = player.contractYears <= 1 ? 0.7 : player.contractYears <= 3 ? 1.0 : 0.9;
  const salaryPenalty = player.salary > 30 ? -10 : player.salary > 20 ? -5 : 0;
  const starBonus = player.isStar ? 25 : 0;

  return Math.round((ratingValue + potentialBonus + starBonus + salaryPenalty) * ageFactor * contractFactor);
}

export function calculateDraftPickValue(pick: DraftPick, projectedPosition?: number): number {
  const pos = projectedPosition || pick.projectedPosition || 15;
  const baseValue = Math.max(20, 150 - pos * 4);
  const roundMultiplier = pick.round === 1 ? 1.0 : 0.35;
  const yearDiscount = pick.year > 1 ? 0.85 : 1.0;

  return Math.round(baseValue * roundMultiplier * yearDiscount);
}

/**
 * Calculate diminishing returns for multiple players
 *
 * KEY LESSON: More players doesn't automatically mean more value.
 * Quality over quantity - you can't trade 5 bench players for a star.
 * First player = 100%, second = 85%, third = 70%, etc.
 */
function calculateDiminishingReturns(players: Player[]): number {
  // Sort by value (best player first)
  const sortedByValue = [...players].sort((a, b) =>
    calculatePlayerValue(b) - calculatePlayerValue(a)
  );

  let totalValue = 0;
  const diminishingFactors = [1.0, 0.85, 0.70, 0.55, 0.40];

  sortedByValue.forEach((player, index) => {
    const factor = diminishingFactors[Math.min(index, diminishingFactors.length - 1)];
    totalValue += calculatePlayerValue(player) * factor;
  });

  return totalValue;
}

/**
 * Star player premium - stars are irreplaceable difference-makers
 *
 * LESSON: Stars are worth more than their raw value because they're
 * irreplaceable. This is why teams "overpay" for superstars.
 */
function calculateStarPremium(players: Player[]): number {
  let premium = 0;
  players.forEach(player => {
    if (player.isStar) {
      premium += 30; // Significant premium for star players
    }
    if (player.overallRating >= 85) {
      premium += 15; // Premium for elite-level players
    } else if (player.overallRating >= 80) {
      premium += 10; // Moderate premium for very good players
    }
  });
  return premium;
}

/**
 * Quality threshold penalty - bunch of bad players isn't worth one good one
 *
 * LESSON: Quantity doesn't compensate for quality. You can't dump your
 * problems on another team and call it a fair trade.
 */
function calculateQualityPenalty(players: Player[]): number {
  let penalty = 0;
  const subparPlayers = players.filter(p => p.overallRating < 70);

  // Each player below 70 OVR adds a penalty
  subparPlayers.forEach(player => {
    penalty += (70 - player.overallRating) * 0.5;
  });

  // Extra penalty if offering more than 2 sub-par players (roster dump)
  if (subparPlayers.length > 2) {
    penalty += (subparPlayers.length - 2) * 15;
  }

  return penalty;
}

/**
 * Position fit bonus/penalty for receiving team
 */
function calculatePositionFit(team: Team, receivingPlayers: Player[]): number {
  let fitScore = 0;
  const positionCount: Record<Position, number> = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 };

  team.roster.forEach(p => positionCount[p.position]++);

  receivingPlayers.forEach(player => {
    if (positionCount[player.position] < 2) {
      fitScore += 10; // Bonus for filling a need
    } else if (positionCount[player.position] >= 4) {
      fitScore -= 10; // Penalty for roster redundancy
    }
  });

  return fitScore;
}

/**
 * Contract value consideration - bad contracts reduce value
 */
function calculateContractBurden(players: Player[]): number {
  let burden = 0;
  players.forEach(player => {
    // Overpaid player penalty (salary > expected for rating)
    const expectedSalary = (player.overallRating - 60) * 0.8 + 5;
    if (player.salary > expectedSalary + 5) {
      burden += (player.salary - expectedSalary) * 2;
    }
    // Long contract on declining player
    if (player.age > 30 && player.contractYears >= 3) {
      burden += 15;
    }
  });
  return burden;
}

/**
 * Calculate the risk level of a trade
 *
 * LESSON: Trades have different risk profiles. Trading proven players
 * for potential is high-risk/high-reward. Some teams can afford that
 * volatility, others can't.
 */
export function calculateTradeRisk(
  playersOffered: Player[],
  playersRequested: Player[],
  picksOffered: DraftPick[],
  picksRequested: DraftPick[]
): { riskLevel: 'low' | 'medium' | 'high'; volatilityImpact: number; explanation: string } {
  let riskScore = 0;
  let explanations: string[] = [];

  // Trading proven talent for picks = high risk
  const provenTalentTraded = playersOffered.filter(p => p.overallRating >= 75 && p.age <= 30);
  const picksReceived = picksRequested.length;

  if (provenTalentTraded.length > 0 && picksReceived > provenTalentTraded.length) {
    riskScore += 30;
    explanations.push('Trading proven talent for future picks increases volatility');
  }

  // Trading for young unproven players = medium risk
  const youngUnproven = playersRequested.filter(p => p.age <= 24 && p.overallRating < 75);
  if (youngUnproven.length > 0) {
    riskScore += 15 * youngUnproven.length;
    explanations.push('Acquiring young unproven players adds uncertainty');
  }

  // Trading away picks = reduces future flexibility
  if (picksOffered.filter(p => p.round === 1).length > 0) {
    riskScore += 20;
    explanations.push('Trading first-round picks limits future options');
  }

  // Star trades are always high-impact
  const starMoved = [...playersOffered, ...playersRequested].some(p => p.isStar);
  if (starMoved) {
    riskScore += 25;
    explanations.push('Star player trades have franchise-altering impact');
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';

  return {
    riskLevel,
    volatilityImpact: riskScore,
    explanation: explanations.length > 0
      ? explanations.join('. ')
      : 'Standard trade with predictable outcomes'
  };
}

/**
 * Validate if trade is legal under salary cap rules
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
        reason: `Over cap teams can only receive $${Math.round(maxIncoming)}M (125% of $${outgoingSalary.toFixed(1)}M outgoing + $100K)`
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
 * Main trade evaluation function with improved logic
 *
 * KEY LESSON: Trade value isn't just about adding up player ratings.
 * Context matters - position fit, contract situations, star power,
 * and diminishing returns all affect true value.
 */
export function evaluateTrade(
  fromTeam: Team,
  toTeam: Team,
  playersOffered: Player[],
  playersRequested: Player[],
  picksOffered: DraftPick[],
  picksRequested: DraftPick[],
): { fairnessScore: number; fromValue: number; toValue: number; analysis: string; riskAssessment: ReturnType<typeof calculateTradeRisk> } {

  // Base values with diminishing returns
  const offeredPlayerValue = calculateDiminishingReturns(playersOffered);
  const requestedPlayerValue = calculateDiminishingReturns(playersRequested);

  // Draft pick values
  const offeredPickValue = picksOffered.reduce((sum, p) => sum + calculateDraftPickValue(p), 0);
  const requestedPickValue = picksRequested.reduce((sum, p) => sum + calculateDraftPickValue(p), 0);

  // Star premiums (what you're giving up vs getting)
  const requestedStarPremium = calculateStarPremium(playersRequested);
  const offeredStarPremium = calculateStarPremium(playersOffered);

  // Quality penalties
  const offeredQualityPenalty = calculateQualityPenalty(playersOffered);
  const requestedQualityPenalty = calculateQualityPenalty(playersRequested);

  // Position fit for AI team (toTeam)
  const positionFitForAI = calculatePositionFit(toTeam, playersOffered);

  // Contract burden
  const offeredContractBurden = calculateContractBurden(playersOffered);
  const requestedContractBurden = calculateContractBurden(playersRequested);

  // Calculate final values
  const fromValue = Math.round(
    offeredPlayerValue +
    offeredPickValue +
    offeredStarPremium -
    offeredQualityPenalty -
    offeredContractBurden +
    positionFitForAI
  );

  const toValue = Math.round(
    requestedPlayerValue +
    requestedPickValue +
    requestedStarPremium -
    requestedQualityPenalty -
    requestedContractBurden
  );

  const diff = fromValue - toValue;
  const avgValue = (fromValue + toValue) / 2 || 1;
  const fairnessScore = Math.round((diff / avgValue) * 100);

  // Risk assessment
  const riskAssessment = calculateTradeRisk(playersOffered, playersRequested, picksOffered, picksRequested);

  // Generate detailed analysis
  let analysis = generateTradeAnalysis(
    fairnessScore,
    fromTeam,
    toTeam,
    playersOffered,
    playersRequested,
    offeredQualityPenalty,
    requestedStarPremium
  );

  return { fairnessScore, fromValue, toValue, analysis, riskAssessment };
}

function generateTradeAnalysis(
  fairnessScore: number,
  fromTeam: Team,
  toTeam: Team,
  playersOffered: Player[],
  playersRequested: Player[],
  qualityPenalty: number,
  starPremium: number
): string {
  let analysis: string;

  if (Math.abs(fairnessScore) <= 10) {
    analysis = 'Fair trade for both sides.';
  } else if (fairnessScore > 10 && fairnessScore <= 30) {
    analysis = `${fromTeam.city} is overpaying slightly.`;
  } else if (fairnessScore > 30) {
    analysis = `${fromTeam.city} is significantly overpaying. The other team is likely to accept.`;
  } else if (fairnessScore < -10 && fairnessScore >= -30) {
    analysis = `${toTeam.city} would need more to make this work.`;
  } else {
    analysis = `This trade heavily favors ${fromTeam.city}. Very unlikely to be accepted.`;
  }

  // Add context about why
  if (qualityPenalty > 20) {
    analysis += ' Multiple low-value players decrease trade appeal - quality matters more than quantity.';
  }
  if (starPremium > 25) {
    analysis += ' Star players command a significant premium in trades.';
  }
  if (playersOffered.length > 3) {
    analysis += ' Trading many players for few reduces overall value due to diminishing returns.';
  }

  return analysis;
}

export function wouldAIAcceptTrade(
  fairnessScore: number,
  aiTeam: Team,
  difficulty: 'easy' | 'medium' | 'hard',
): boolean {
  const threshold = difficulty === 'easy' ? -25 : difficulty === 'medium' ? -10 : 0;
  return fairnessScore >= threshold;
}

export function generateAITradeProposal(
  aiTeam: Team,
  targetTeam: Team,
  allTeams: Team[],
): TradeProposal | null {
  // AI focuses on quality over quantity
  const targetPlayers = targetTeam.roster
    .filter(p => !p.isStar || Math.random() < 0.05) // Very rarely target stars
    .sort((a, b) => calculatePlayerValue(b) - calculatePlayerValue(a));

  if (targetPlayers.length === 0) return null;

  const wanted = targetPlayers[0];
  const wantedValue = calculatePlayerValue(wanted);

  // Find quality matches (prefer 1-2 good players over 3+ mediocre)
  const aiTradeable = aiTeam.roster
    .filter(p => !p.isStar && p.overallRating >= 65) // Don't offer bad players
    .sort((a, b) => calculatePlayerValue(b) - calculatePlayerValue(a));

  let offeredPlayers: Player[] = [];
  let offeredValue = 0;

  // Try to match with 1-2 quality players first
  for (const player of aiTradeable) {
    if (offeredPlayers.length >= 2) break; // Cap at 2 players
    if (offeredValue >= wantedValue * 0.9) break;
    offeredPlayers.push(player);
    offeredValue += calculatePlayerValue(player);
  }

  // Must offer at least 60% of value without picks
  if (offeredValue < wantedValue * 0.6) return null;

  // Add pick only if needed and available
  const picksOffered: DraftPick[] = [];
  if (offeredValue < wantedValue * 0.85 && aiTeam.draftPicks.length > 2) {
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
