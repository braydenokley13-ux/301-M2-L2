import { Team, GameState, StrategyType } from '../data/types';
import { TEAM_CONTEXTS } from './teamContext';
import { generateAITradeProposal, wouldAIAcceptTrade, evaluateTrade } from './tradeSystem';

export interface AIPersonality {
  tradeAggression: number; // 0-1
  starLoyalty: number; // 0-1
  riskTolerance: number; // 0-1
  analyticsReliance: number; // 0-1
  marketSensitivity: number; // 0-1
}

export function generateAIPersonality(team: Team): AIPersonality {
  const context = TEAM_CONTEXTS[team.contextType];

  return {
    tradeAggression: 0.3 + Math.random() * 0.5,
    starLoyalty: context.type === 'star_dependent' ? 0.9 : 0.5 + Math.random() * 0.3,
    riskTolerance: context.ownershipRiskTolerance,
    analyticsReliance: 0.3 + Math.random() * 0.6,
    marketSensitivity: context.type === 'revenue_sensitive' ? 0.9 : 0.3 + Math.random() * 0.4,
  };
}

export function getAIStrategy(team: Team, currentWins: number, currentLosses: number): StrategyType {
  const totalGames = currentWins + currentLosses;
  if (totalGames === 0) {
    // Based on team context
    switch (team.contextType) {
      case 'legacy_power': return 'aggressive_push';
      case 'small_market_reset': return 'stability_first';
      case 'revenue_sensitive': return 'stability_first';
      case 'cash_rich_expansion': return 'aggressive_push';
      case 'star_dependent': return 'boom_bust_swing';
    }
  }

  const winPct = currentWins / totalGames;

  if (winPct > 0.65) return 'boom_bust_swing'; // contender goes all in
  if (winPct > 0.5) return 'aggressive_push'; // competitive team pushes
  return 'stability_first'; // bad teams rebuild
}

export function processAIOffseason(
  teams: Team[],
  userTeamId: string,
  standings: Record<string, { wins: number; losses: number }>,
): { trades: string[]; signings: string[] } {
  const trades: string[] = [];
  const signings: string[] = [];

  const aiTeams = teams.filter(t => t.id !== userTeamId);

  for (const aiTeam of aiTeams) {
    const record = standings[aiTeam.id] || { wins: 0, losses: 0 };
    const strategy = getAIStrategy(aiTeam, record.wins, record.losses);
    const personality = generateAIPersonality(aiTeam);

    // AI might try to make a trade
    if (Math.random() < personality.tradeAggression * 0.3) {
      const targetTeam = aiTeams.filter(t => t.id !== aiTeam.id)[
        Math.floor(Math.random() * (aiTeams.length - 1))
      ];

      if (targetTeam) {
        const proposal = generateAITradeProposal(aiTeam, targetTeam, teams);
        if (proposal) {
          const evaluation = evaluateTrade(
            aiTeam,
            targetTeam,
            aiTeam.roster.filter(p => proposal.playersOffered.includes(p.id)),
            targetTeam.roster.filter(p => proposal.playersRequested.includes(p.id)),
            aiTeam.draftPicks.filter(p => proposal.picksOffered.includes(p.id)),
            targetTeam.draftPicks.filter(p => proposal.picksRequested.includes(p.id)),
          );

          if (wouldAIAcceptTrade(evaluation.fairnessScore, targetTeam, 'medium')) {
            const offered = aiTeam.roster.filter(p => proposal.playersOffered.includes(p.id)).map(p => p.name).join(', ');
            const requested = targetTeam.roster.filter(p => proposal.playersRequested.includes(p.id)).map(p => p.name).join(', ');
            trades.push(`${aiTeam.city} ${aiTeam.name} traded ${offered} to ${targetTeam.city} ${targetTeam.name} for ${requested}`);
          }
        }
      }
    }
  }

  return { trades, signings };
}
