import { Player, Team, TradeProposal, DraftPick } from '../data/types';

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

export function evaluateTrade(
  fromTeam: Team,
  toTeam: Team,
  playersOffered: Player[],
  playersRequested: Player[],
  picksOffered: DraftPick[],
  picksRequested: DraftPick[],
): { fairnessScore: number; fromValue: number; toValue: number; analysis: string } {
  const offeredPlayerValue = playersOffered.reduce((sum, p) => sum + calculatePlayerValue(p), 0);
  const requestedPlayerValue = playersRequested.reduce((sum, p) => sum + calculatePlayerValue(p), 0);
  const offeredPickValue = picksOffered.reduce((sum, p) => sum + calculateDraftPickValue(p), 0);
  const requestedPickValue = picksRequested.reduce((sum, p) => sum + calculateDraftPickValue(p), 0);

  const fromValue = offeredPlayerValue + offeredPickValue;
  const toValue = requestedPlayerValue + requestedPickValue;

  const diff = fromValue - toValue;
  const avgValue = (fromValue + toValue) / 2 || 1;
  const fairnessScore = Math.round((diff / avgValue) * 100);

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

  return { fairnessScore, fromValue, toValue, analysis };
}

export function wouldAIAcceptTrade(
  fairnessScore: number,
  aiTeam: Team,
  difficulty: 'easy' | 'medium' | 'hard',
): boolean {
  const threshold = difficulty === 'easy' ? -25 : difficulty === 'medium' ? -10 : 0;
  // AI accepts if fairness is at or above threshold (positive = offering team overpays)
  return fairnessScore >= threshold;
}

export function generateAITradeProposal(
  aiTeam: Team,
  targetTeam: Team,
  allTeams: Team[],
): TradeProposal | null {
  // AI looks for players it wants from the target
  const targetPlayers = targetTeam.roster
    .filter(p => !p.isStar || Math.random() < 0.1)
    .sort((a, b) => calculatePlayerValue(b) - calculatePlayerValue(a));

  if (targetPlayers.length === 0) return null;

  const wanted = targetPlayers[0];
  const wantedValue = calculatePlayerValue(wanted);

  // Find combination of AI players to match value
  const aiTradeable = aiTeam.roster
    .filter(p => !p.isStar)
    .sort((a, b) => calculatePlayerValue(b) - calculatePlayerValue(a));

  let offeredPlayers: Player[] = [];
  let offeredValue = 0;

  for (const player of aiTradeable) {
    if (offeredValue >= wantedValue * 0.85) break;
    offeredPlayers.push(player);
    offeredValue += calculatePlayerValue(player);
    if (offeredPlayers.length >= 3) break;
  }

  if (offeredValue < wantedValue * 0.5) return null;

  // Maybe add a pick
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
