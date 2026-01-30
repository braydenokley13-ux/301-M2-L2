import { create } from 'zustand';
import { GameState, Team, Player, TradeProposal, NewsItem, SeasonResult, StrategyType, FinancialState, VolatilityMetrics, RiskDecision } from '../data/types';
import { initializeAllTeams } from '../data/teams';
import { generateAllPlayers, fillRostersToMinimum } from '../data/players';
import { generateFreeAgents, calculatePlayerInterest, willAcceptOffer, signFreeAgent } from '../game/freeAgency';
import { generateDraftClass, draftProspectToPlayer, aiDraftPick } from '../game/draftSystem';
import { evaluateTrade, executeTrade, wouldAIAcceptTrade, validateTradeSalary } from '../game/tradeSystem';
import { simulateRegularSeason, simulatePlayoffs, getSeasonMVP, PlayoffBracketRound } from '../game/seasonSimulator';
import { generateFinancialReport, getPlayoffRoundFromResult, SALARY_CAP, LUXURY_TAX_THRESHOLD, SALARY_FLOOR } from '../game/economics';

interface GameStore extends GameState {
  // Initialization
  initializeGame: (teamId: string, difficulty: 'easy' | 'medium' | 'hard', strategy: StrategyType) => void;

  // Phase management
  setPhase: (phase: GameState['phase']) => void;
  advancePhase: () => void;
  startNextSeason: () => void;

  // Strategy
  setStrategy: (strategy: StrategyType) => void;

  // Trades
  proposeTrade: (proposal: Omit<TradeProposal, 'id' | 'status' | 'fairnessScore'>) => { accepted: boolean; analysis: string };

  // Free Agency
  signPlayer: (freeAgentId: string, salary: number, years: number) => { success: boolean; message: string };

  // Draft
  draftPlayer: (prospectId: string) => Player | null;
  simulateAIDraftPicks: (untilPick: number) => void;

  // Season
  simulateSeason: () => void;

  // Risk tracking
  addRiskDecision: (decision: Omit<RiskDecision, 'id'>) => void;

  // News
  addNews: (news: Omit<NewsItem, 'id'>) => void;

  // Computed helpers
  getUserTeam: () => Team | undefined;
  getPlayersByTeam: (teamId: string) => Player[];
  getStandings: () => { eastern: Team[]; western: Team[] };

  // Internal state
  allPlayers: Player[];
  standings: Record<string, { wins: number; losses: number }>;
  playoffBracket: PlayoffBracketRound[];
  draftOrder: string[];
  currentDraftPick: number;
}

// Default financial state
const defaultFinancials: FinancialState = {
  salaryCap: SALARY_CAP,
  luxuryTaxThreshold: LUXURY_TAX_THRESHOLD,
  salaryFloor: SALARY_FLOOR,
  currentPayroll: 0,
  luxuryTaxOwed: 0,
  revenue: 100,
  expenses: 0,
  profit: 0,
  consecutiveTaxYears: 0,
};

// Default volatility metrics
const defaultVolatility: VolatilityMetrics = {
  winVariance: 0,
  riskDecisionsMade: 0,
  bigSwingsAttempted: 0,
  volatilityRating: 'stable',
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  userId: 'user-1',
  teamId: '',
  currentSeason: 1,
  currentWeek: 0,
  phase: 'intro', // Start with intro page
  strategy: 'stability_first',
  salaryCap: SALARY_CAP,
  salaryCapSpace: SALARY_CAP,
  fanApproval: 70,
  ownerConfidence: 70,
  mediaRating: 50,
  gmLevel: 1,
  gmExperience: 0,
  achievements: [],
  difficulty: 'medium',
  teams: [],
  freeAgents: [],
  draftProspects: [],
  tradeHistory: [],
  seasonResults: [],
  newsLog: [],
  momentum: 0,
  allPlayers: [],
  standings: {},
  playoffBracket: [],
  draftOrder: [],
  currentDraftPick: 0,
  // New state
  financials: defaultFinancials,
  volatility: defaultVolatility,
  riskDecisions: [],
  maxSeasons: 3, // Game ends after 3 seasons

  initializeGame: (teamId, difficulty, strategy) => {
    const teams = initializeAllTeams();
    let players = generateAllPlayers();
    players = fillRostersToMinimum(teams, players);

    // Assign players to team rosters
    const teamsWithRosters = teams.map(t => {
      const teamPlayers = players.filter(p => p.teamId === t.id);
      return {
        ...t,
        roster: teamPlayers,
        totalSalary: teamPlayers.reduce((sum, p) => sum + p.salary, 0),
      };
    });

    const userTeam = teamsWithRosters.find(t => t.id === teamId)!;
    const freeAgents = generateFreeAgents(30);
    const draftProspects = generateDraftClass(60);

    // Initialize financials
    const initialFinancials: FinancialState = {
      ...defaultFinancials,
      currentPayroll: userTeam.totalSalary,
    };

    set({
      teamId,
      difficulty,
      strategy,
      teams: teamsWithRosters,
      allPlayers: players,
      freeAgents,
      draftProspects,
      phase: 'onboarding',
      salaryCap: SALARY_CAP,
      salaryCapSpace: SALARY_CAP - userTeam.totalSalary,
      fanApproval: userTeam.fanbase,
      ownerConfidence: 70,
      mediaRating: 50,
      financials: initialFinancials,
      volatility: defaultVolatility,
      riskDecisions: [],
      newsLog: [{
        id: 'news-start',
        week: 0,
        season: 1,
        title: `Welcome to ${userTeam.city}!`,
        body: `You have been hired as the new GM of the ${userTeam.city} ${userTeam.name}. You have 3 seasons to prove yourself. Remember: risk isn't about courage - it's about whether your system can absorb the consequences.`,
        type: 'general',
        teamIds: [teamId],
      }],
    });
  },

  setPhase: (phase) => set({ phase }),

  advancePhase: () => {
    const state = get();
    const phases: GameState['phase'][] = [
      'preseason', 'regular_season', 'playoffs', 'season_end',
      'offseason_draft', 'offseason_free_agency', 'preseason',
    ];
    const currentIdx = phases.indexOf(state.phase);
    if (currentIdx >= 0 && currentIdx < phases.length - 1) {
      set({ phase: phases[currentIdx + 1] });
    }
  },

  startNextSeason: () => {
    const state = get();

    // Check if game should end (after 3 seasons)
    if (state.currentSeason >= state.maxSeasons) {
      set({ phase: 'game_complete' });
      return;
    }

    // Generate new draft class and free agents for next season
    const draftProspects = generateDraftClass(60);
    const freeAgents = generateFreeAgents(30);

    // Age players and update contracts
    const updatedPlayers = state.allPlayers.map(p => ({
      ...p,
      age: p.age + 1,
      contractYears: Math.max(0, p.contractYears - 1),
    }));

    // Reset team records
    const updatedTeams = state.teams.map(t => ({
      ...t,
      wins: 0,
      losses: 0,
    }));

    set({
      currentSeason: state.currentSeason + 1,
      currentWeek: 0,
      phase: 'preseason',
      allPlayers: updatedPlayers,
      teams: updatedTeams,
      draftProspects,
      freeAgents,
      newsLog: [...state.newsLog, {
        id: `news-newseason-${state.currentSeason + 1}`,
        week: 0,
        season: state.currentSeason + 1,
        title: `Season ${state.currentSeason + 1} Begins`,
        body: `A new season is upon us. ${state.maxSeasons - state.currentSeason} season(s) remaining in your tenure.`,
        type: 'season',
        teamIds: [state.teamId],
      }],
    });
  },

  setStrategy: (strategy) => {
    const state = get();

    // Track strategy change as a risk decision
    const riskLevel = strategy === 'boom_bust_swing' ? 'high' :
                      strategy === 'aggressive_push' ? 'medium' : 'low';

    if (state.strategy !== strategy) {
      get().addRiskDecision({
        season: state.currentSeason,
        type: 'strategy',
        description: `Changed strategy to ${strategy.replace('_', ' ')}`,
        riskLevel,
        outcome: 'pending',
        volatilityImpact: riskLevel === 'high' ? 20 : riskLevel === 'medium' ? 10 : 0,
      });
    }

    set({ strategy });
  },

  proposeTrade: (proposal) => {
    const state = get();
    const fromTeam = state.teams.find(t => t.id === proposal.fromTeamId)!;
    const toTeam = state.teams.find(t => t.id === proposal.toTeamId)!;

    const playersOffered = state.allPlayers.filter(p => proposal.playersOffered.includes(p.id));
    const playersRequested = state.allPlayers.filter(p => proposal.playersRequested.includes(p.id));
    const picksOffered = fromTeam.draftPicks.filter(p => proposal.picksOffered.includes(p.id));
    const picksRequested = toTeam.draftPicks.filter(p => proposal.picksRequested.includes(p.id));

    // Validate salary cap rules
    const salaryValidation = validateTradeSalary(fromTeam, toTeam, playersOffered, playersRequested, state.salaryCap);
    if (!salaryValidation.valid) {
      return { accepted: false, analysis: `Trade rejected: ${salaryValidation.reason}` };
    }

    const evaluation = evaluateTrade(fromTeam, toTeam, playersOffered, playersRequested, picksOffered, picksRequested);
    const accepted = wouldAIAcceptTrade(evaluation.fairnessScore, toTeam, state.difficulty);

    // Track as risk decision
    get().addRiskDecision({
      season: state.currentSeason,
      type: 'trade',
      description: `Trade with ${toTeam.city}: ${playersOffered.map(p => p.name).join(', ')} for ${playersRequested.map(p => p.name).join(', ')}`,
      riskLevel: evaluation.riskAssessment.riskLevel,
      outcome: accepted ? 'pending' : 'failure',
      volatilityImpact: evaluation.riskAssessment.volatilityImpact,
    });

    if (accepted) {
      const { updatedTeams, updatedPlayers } = executeTrade(state.teams, {
        ...proposal,
        id: `trade-${Date.now()}`,
        status: 'accepted',
        fairnessScore: evaluation.fairnessScore,
      }, state.allPlayers);

      const userTeam = updatedTeams.find(t => t.id === state.teamId)!;
      const newCapSpace = state.salaryCap - userTeam.totalSalary;

      // Update volatility metrics
      const newVolatility = {
        ...state.volatility,
        riskDecisionsMade: state.volatility.riskDecisionsMade + 1,
        bigSwingsAttempted: evaluation.riskAssessment.riskLevel === 'high'
          ? state.volatility.bigSwingsAttempted + 1
          : state.volatility.bigSwingsAttempted,
      };

      set({
        teams: updatedTeams,
        allPlayers: updatedPlayers,
        salaryCapSpace: newCapSpace,
        financials: {
          ...state.financials,
          currentPayroll: userTeam.totalSalary,
        },
        volatility: newVolatility,
        tradeHistory: [...state.tradeHistory, {
          ...proposal,
          id: `trade-${Date.now()}`,
          status: 'accepted',
          fairnessScore: evaluation.fairnessScore,
        }],
        newsLog: [...state.newsLog, {
          id: `news-trade-${Date.now()}`,
          week: state.currentWeek,
          season: state.currentSeason,
          title: 'Trade completed!',
          body: `${fromTeam.city} ${fromTeam.name} and ${toTeam.city} ${toTeam.name} have completed a trade. Risk level: ${evaluation.riskAssessment.riskLevel}.`,
          type: 'trade',
          teamIds: [fromTeam.id, toTeam.id],
        }],
      });
    }

    return { accepted, analysis: evaluation.analysis };
  },

  signPlayer: (freeAgentId, salary, years) => {
    const state = get();
    const freeAgent = state.freeAgents.find(fa => fa.player.id === freeAgentId);
    if (!freeAgent) return { success: false, message: 'Player not found.' };

    const userTeam = state.teams.find(t => t.id === state.teamId)!;
    if (salary > state.salaryCapSpace) return { success: false, message: 'Not enough cap space.' };

    const interest = calculatePlayerInterest(freeAgent.player, userTeam, salary, freeAgent.askingPrice);
    const accepts = willAcceptOffer(interest, state.difficulty);

    if (!accepts) return { success: false, message: `${freeAgent.player.name} is not interested in your offer (Interest: ${interest}%).` };

    const newPlayer = signFreeAgent(freeAgent, userTeam, salary, years);
    const updatedPlayers = [...state.allPlayers, newPlayer];
    const updatedTeams = state.teams.map(t => {
      if (t.id === state.teamId) {
        const newRoster = [...t.roster, newPlayer];
        return { ...t, roster: newRoster, totalSalary: newRoster.reduce((s, p) => s + p.salary, 0) };
      }
      return t;
    });

    const newCapSpace = state.salaryCapSpace - salary;

    // Track risk level based on contract size
    const riskLevel = salary > 25 ? 'high' : salary > 15 ? 'medium' : 'low';
    get().addRiskDecision({
      season: state.currentSeason,
      type: 'signing',
      description: `Signed ${newPlayer.name} to ${years}-year, $${salary}M contract`,
      riskLevel,
      outcome: 'pending',
      volatilityImpact: riskLevel === 'high' ? 15 : riskLevel === 'medium' ? 8 : 3,
    });

    set({
      teams: updatedTeams,
      allPlayers: updatedPlayers,
      freeAgents: state.freeAgents.filter(fa => fa.player.id !== freeAgentId),
      salaryCapSpace: newCapSpace,
      financials: {
        ...state.financials,
        currentPayroll: state.financials.currentPayroll + salary,
      },
      newsLog: [...state.newsLog, {
        id: `news-sign-${Date.now()}`,
        week: state.currentWeek,
        season: state.currentSeason,
        title: `${newPlayer.name} signs with ${userTeam.city}!`,
        body: `${newPlayer.name} has signed a ${years}-year, $${salary}M contract with the ${userTeam.city} ${userTeam.name}.`,
        type: 'free_agency',
        teamIds: [state.teamId],
      }],
    });

    return { success: true, message: `${newPlayer.name} has signed!` };
  },

  draftPlayer: (prospectId) => {
    const state = get();
    const prospect = state.draftProspects.find(p => p.id === prospectId);
    if (!prospect) return null;

    const newPlayer = draftProspectToPlayer(prospect, state.teamId);
    const updatedPlayers = [...state.allPlayers, newPlayer];
    const updatedTeams = state.teams.map(t => {
      if (t.id === state.teamId) {
        const newRoster = [...t.roster, newPlayer];
        return { ...t, roster: newRoster, totalSalary: newRoster.reduce((s, p) => s + p.salary, 0) };
      }
      return t;
    });

    // FIX: Calculate new cap space after draft
    const userTeam = updatedTeams.find(t => t.id === state.teamId)!;
    const newCapSpace = state.salaryCap - userTeam.totalSalary;

    // Track draft pick risk
    const riskLevel = prospect.variance > 15 ? 'high' : prospect.variance > 10 ? 'medium' : 'low';
    get().addRiskDecision({
      season: state.currentSeason,
      type: 'draft',
      description: `Drafted ${prospect.name} (${prospect.position}) - Variance: ${prospect.variance}`,
      riskLevel,
      outcome: 'pending',
      volatilityImpact: prospect.variance,
    });

    set({
      teams: updatedTeams,
      allPlayers: updatedPlayers,
      draftProspects: state.draftProspects.filter(p => p.id !== prospectId),
      salaryCapSpace: newCapSpace, // FIX: Update cap space
      financials: {
        ...state.financials,
        currentPayroll: userTeam.totalSalary,
      },
      newsLog: [...state.newsLog, {
        id: `news-draft-${Date.now()}`,
        week: state.currentWeek,
        season: state.currentSeason,
        title: `${prospect.name} drafted!`,
        body: `The ${state.teams.find(t => t.id === state.teamId)?.city} selected ${prospect.name} from ${prospect.college}. Rookie contract: $${newPlayer.salary}M/year.`,
        type: 'draft',
        teamIds: [state.teamId],
      }],
    });

    return newPlayer;
  },

  simulateAIDraftPicks: (untilPick) => {
    const state = get();
    let prospects = [...state.draftProspects];
    let teams = [...state.teams];
    let players = [...state.allPlayers];
    const news = [...state.newsLog];

    const draftOrder = state.draftOrder;

    for (let pick = state.currentDraftPick; pick < untilPick && pick < draftOrder.length; pick++) {
      const teamId = draftOrder[pick];
      if (teamId === state.teamId) break; // User's pick

      const team = teams.find(t => t.id === teamId)!;
      const chosen = aiDraftPick(team, prospects);
      if (!chosen) continue;

      const newPlayer = draftProspectToPlayer(chosen, teamId);
      players.push(newPlayer);
      prospects = prospects.filter(p => p.id !== chosen.id);

      teams = teams.map(t => {
        if (t.id === teamId) {
          const newRoster = [...t.roster, newPlayer];
          return { ...t, roster: newRoster, totalSalary: newRoster.reduce((s, p) => s + p.salary, 0) };
        }
        return t;
      });

      news.push({
        id: `news-aidraft-${pick}`,
        week: 0,
        season: state.currentSeason,
        title: `Pick #${pick + 1}: ${chosen.name}`,
        body: `The ${team.city} ${team.name} select ${chosen.name} (${chosen.position}) from ${chosen.college}.`,
        type: 'draft',
        teamIds: [teamId],
      });
    }

    set({
      teams,
      allPlayers: players,
      draftProspects: prospects,
      newsLog: news,
      currentDraftPick: untilPick,
    });
  },

  simulateSeason: () => {
    const state = get();
    const { standings } = simulateRegularSeason(state.teams);
    const playoffs = simulatePlayoffs(state.teams, standings);
    const mvp = getSeasonMVP(state.teams);

    // Update team records
    const updatedTeams = state.teams.map(t => ({
      ...t,
      wins: standings[t.id]?.wins || 0,
      losses: standings[t.id]?.losses || 0,
    }));

    const userRecord = standings[state.teamId] || { wins: 0, losses: 0 };
    const userPlayoffResult = playoffs.results[state.teamId] || 'missed';

    // Fan approval based on performance (82-game scale)
    let approvalChange = 0;
    if (userRecord.wins >= 50) approvalChange = 15;
    else if (userRecord.wins >= 42) approvalChange = 5;
    else if (userRecord.wins >= 35) approvalChange = -5;
    else approvalChange = -15;

    if (userPlayoffResult === 'champion') approvalChange += 30;
    else if (userPlayoffResult === 'finals') approvalChange += 15;
    else if (userPlayoffResult === 'conference_finals') approvalChange += 8;

    // Calculate financials
    const userTeam = updatedTeams.find(t => t.id === state.teamId)!;
    const playoffRound = getPlayoffRoundFromResult(userPlayoffResult);
    const isChampion = userPlayoffResult === 'champion';
    const financialReport = generateFinancialReport(
      userTeam,
      userRecord.wins,
      playoffRound,
      isChampion,
      state.financials.consecutiveTaxYears
    );

    // Calculate volatility for this season
    const previousWins = state.seasonResults.map(s => s.wins);
    const allWins = [...previousWins, userRecord.wins];
    const avgWins = allWins.reduce((a, b) => a + b, 0) / allWins.length;
    const winVariance = allWins.length > 1
      ? allWins.reduce((sum, w) => sum + Math.pow(w - avgWins, 2), 0) / allWins.length
      : 0;
    const winStdDev = Math.sqrt(winVariance);

    const volatilityRating: VolatilityMetrics['volatilityRating'] =
      winStdDev < 5 ? 'stable' :
      winStdDev < 10 ? 'moderate' :
      winStdDev < 15 ? 'volatile' : 'extreme';

    // Determine risk rating for season
    const highRiskDecisions = state.riskDecisions.filter(d =>
      d.season === state.currentSeason && d.riskLevel === 'high'
    ).length;
    const riskRating: SeasonResult['riskRating'] =
      highRiskDecisions >= 3 ? 'aggressive' :
      highRiskDecisions >= 1 ? 'balanced' : 'conservative';

    // Update risk decision outcomes based on season results
    const updatedRiskDecisions = state.riskDecisions.map(d => {
      if (d.season === state.currentSeason && d.outcome === 'pending') {
        // Determine outcome based on overall performance
        const wasSuccessful = userRecord.wins >= 45 || userPlayoffResult !== 'missed';
        return {
          ...d,
          outcome: wasSuccessful ? 'success' as const : 'neutral' as const,
        };
      }
      return d;
    });

    const seasonResult: SeasonResult = {
      season: state.currentSeason,
      wins: userRecord.wins,
      losses: userRecord.losses,
      playoffResult: userPlayoffResult,
      mvp: mvp?.name || 'Unknown',
      bestPlayer: mvp?.name || 'Unknown',
      fanApproval: Math.max(0, Math.min(100, state.fanApproval + approvalChange)),
      revenue: financialReport.revenue,
      payroll: financialReport.currentPayroll,
      luxuryTaxPaid: financialReport.luxuryTaxOwed,
      profit: financialReport.profit,
      riskRating,
      bigSwings: state.volatility.bigSwingsAttempted,
      volatilityScore: winStdDev,
    };

    // Generate draft order (reverse of standings for lottery)
    const sortedTeams = [...updatedTeams]
      .filter(t => playoffs.results[t.id] === 'missed')
      .sort((a, b) => a.wins - b.wins)
      .map(t => t.id);
    const playoffTeams = [...updatedTeams]
      .filter(t => playoffs.results[t.id] !== 'missed')
      .sort((a, b) => {
        const resultOrder: Record<string, number> = { first_round: 0, second_round: 1, conference_finals: 2, finals: 3, champion: 4 };
        return (resultOrder[playoffs.results[a.id]] || 0) - (resultOrder[playoffs.results[b.id]] || 0);
      })
      .map(t => t.id);

    // Build full two-round draft order
    const firstRound = [...sortedTeams, ...playoffTeams];
    const secondRound = [...firstRound];
    const fullDraftOrder = [...firstRound, ...secondRound];

    const championTeam = updatedTeams.find(t => t.id === playoffs.champion);
    const newsItems: NewsItem[] = [
      {
        id: `news-season-end-${state.currentSeason}`,
        week: 82,
        season: state.currentSeason,
        title: 'Season Complete!',
        body: `The ${state.currentSeason} season has concluded. Your record: ${userRecord.wins}-${userRecord.losses}. ${state.maxSeasons - state.currentSeason > 0 ? `${state.maxSeasons - state.currentSeason} season(s) remaining.` : 'Final season complete!'}`,
        type: 'season',
        teamIds: [state.teamId],
      },
      {
        id: `news-champion-${state.currentSeason}`,
        week: 82,
        season: state.currentSeason,
        title: `${championTeam?.city} ${championTeam?.name} win the championship!`,
        body: `Congratulations to the ${championTeam?.city} ${championTeam?.name} on their title!`,
        type: 'season',
        teamIds: [playoffs.champion],
      },
    ];

    if (mvp) {
      newsItems.push({
        id: `news-mvp-${state.currentSeason}`,
        week: 82,
        season: state.currentSeason,
        title: `${mvp.name} named MVP!`,
        body: `${mvp.name} has been named the Most Valuable Player for the season.`,
        type: 'season',
        teamIds: [mvp.teamId],
      });
    }

    // Add financial news
    if (financialReport.luxuryTaxOwed > 0) {
      newsItems.push({
        id: `news-tax-${state.currentSeason}`,
        week: 82,
        season: state.currentSeason,
        title: 'Luxury Tax Bill',
        body: `Your team paid $${financialReport.luxuryTaxOwed.toFixed(1)}M in luxury tax this season. This is the cost of aggressive spending.`,
        type: 'general',
        teamIds: [state.teamId],
      });
    }

    set({
      teams: updatedTeams,
      standings,
      playoffBracket: playoffs.bracket,
      phase: 'season_end',
      fanApproval: Math.max(0, Math.min(100, state.fanApproval + approvalChange)),
      ownerConfidence: Math.max(0, Math.min(100, state.ownerConfidence + Math.floor(approvalChange * 0.7))),
      seasonResults: [...state.seasonResults, seasonResult],
      newsLog: [...state.newsLog, ...newsItems],
      draftOrder: fullDraftOrder,
      currentDraftPick: 0,
      gmExperience: state.gmExperience + 100 + userRecord.wins,
      financials: financialReport,
      volatility: {
        ...state.volatility,
        winVariance,
        volatilityRating,
      },
      riskDecisions: updatedRiskDecisions,
    });
  },

  addRiskDecision: (decision) => {
    const state = get();
    const newDecision: RiskDecision = {
      ...decision,
      id: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    set({
      riskDecisions: [...state.riskDecisions, newDecision],
    });
  },

  addNews: (news) => {
    set(state => ({
      newsLog: [...state.newsLog, { ...news, id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }],
    }));
  },

  getUserTeam: () => {
    const state = get();
    return state.teams.find(t => t.id === state.teamId);
  },

  getPlayersByTeam: (teamId) => {
    const state = get();
    return state.allPlayers.filter(p => p.teamId === teamId);
  },

  getStandings: () => {
    const state = get();
    const eastern = state.teams
      .filter(t => t.conference === 'Eastern')
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    const western = state.teams
      .filter(t => t.conference === 'Western')
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    return { eastern, western };
  },
}));
