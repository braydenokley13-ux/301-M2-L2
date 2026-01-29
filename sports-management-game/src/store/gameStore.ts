import { create } from 'zustand';
import { GameState, Team, Player, TradeProposal, NewsItem, SeasonResult, StrategyType } from '../data/types';
import { initializeAllTeams } from '../data/teams';
import { generateAllPlayers, fillRostersToMinimum } from '../data/players';
import { generateFreeAgents, calculatePlayerInterest, willAcceptOffer, signFreeAgent } from '../game/freeAgency';
import { generateDraftClass, draftProspectToPlayer, aiDraftPick } from '../game/draftSystem';
import { evaluateTrade, executeTrade, wouldAIAcceptTrade } from '../game/tradeSystem';
import { simulateRegularSeason, simulatePlayoffs, getSeasonMVP, PlayoffBracketRound } from '../game/seasonSimulator';
// AI manager available for future offseason processing
// import { processAIOffseason } from '../game/aiManager';

interface GameStore extends GameState {
  // Initialization
  initializeGame: (teamId: string, difficulty: 'easy' | 'medium' | 'hard', strategy: StrategyType) => void;

  // Phase management
  setPhase: (phase: GameState['phase']) => void;
  advancePhase: () => void;

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

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  userId: 'user-1',
  teamId: '',
  currentSeason: 1,
  currentWeek: 0,
  phase: 'team_selection',
  strategy: 'stability_first',
  salaryCap: 140,
  salaryCapSpace: 140,
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

    set({
      teamId,
      difficulty,
      strategy,
      teams: teamsWithRosters,
      allPlayers: players,
      freeAgents,
      draftProspects,
      phase: 'preseason',
      salaryCap: 140,
      salaryCapSpace: 140 - userTeam.totalSalary,
      fanApproval: userTeam.fanbase,
      ownerConfidence: 70,
      mediaRating: 50,
      newsLog: [{
        id: 'news-start',
        week: 0,
        season: 1,
        title: `Welcome to ${userTeam.city}!`,
        body: `You have been hired as the new GM of the ${userTeam.city} ${userTeam.name}. Your journey begins now.`,
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

  setStrategy: (strategy) => set({ strategy }),

  proposeTrade: (proposal) => {
    const state = get();
    const fromTeam = state.teams.find(t => t.id === proposal.fromTeamId)!;
    const toTeam = state.teams.find(t => t.id === proposal.toTeamId)!;

    const playersOffered = state.allPlayers.filter(p => proposal.playersOffered.includes(p.id));
    const playersRequested = state.allPlayers.filter(p => proposal.playersRequested.includes(p.id));
    const picksOffered = fromTeam.draftPicks.filter(p => proposal.picksOffered.includes(p.id));
    const picksRequested = toTeam.draftPicks.filter(p => proposal.picksRequested.includes(p.id));

    const evaluation = evaluateTrade(fromTeam, toTeam, playersOffered, playersRequested, picksOffered, picksRequested);
    const accepted = wouldAIAcceptTrade(evaluation.fairnessScore, toTeam, state.difficulty);

    if (accepted) {
      const { updatedTeams, updatedPlayers } = executeTrade(state.teams, {
        ...proposal,
        id: `trade-${Date.now()}`,
        status: 'accepted',
        fairnessScore: evaluation.fairnessScore,
      }, state.allPlayers);

      const userTeam = updatedTeams.find(t => t.id === state.teamId)!;

      set({
        teams: updatedTeams,
        allPlayers: updatedPlayers,
        salaryCapSpace: state.salaryCap - userTeam.totalSalary,
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
          body: `${fromTeam.city} ${fromTeam.name} and ${toTeam.city} ${toTeam.name} have completed a trade.`,
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

    set({
      teams: updatedTeams,
      allPlayers: updatedPlayers,
      freeAgents: state.freeAgents.filter(fa => fa.player.id !== freeAgentId),
      salaryCapSpace: state.salaryCapSpace - salary,
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

    set({
      teams: updatedTeams,
      allPlayers: updatedPlayers,
      draftProspects: state.draftProspects.filter(p => p.id !== prospectId),
      newsLog: [...state.newsLog, {
        id: `news-draft-${Date.now()}`,
        week: state.currentWeek,
        season: state.currentSeason,
        title: `${prospect.name} drafted!`,
        body: `The ${state.teams.find(t => t.id === state.teamId)?.city} selected ${prospect.name} from ${prospect.college}.`,
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

    // Fan approval based on performance
    let approvalChange = 0;
    if (userRecord.wins >= 50) approvalChange = 15;
    else if (userRecord.wins >= 42) approvalChange = 5;
    else if (userRecord.wins >= 35) approvalChange = -5;
    else approvalChange = -15;

    if (userPlayoffResult === 'champion') approvalChange += 30;
    else if (userPlayoffResult === 'finals') approvalChange += 15;
    else if (userPlayoffResult === 'conference_finals') approvalChange += 8;

    const seasonResult: SeasonResult = {
      season: state.currentSeason,
      wins: userRecord.wins,
      losses: userRecord.losses,
      playoffResult: userPlayoffResult,
      mvp: mvp?.name || 'Unknown',
      bestPlayer: mvp?.name || 'Unknown',
      fanApproval: Math.max(0, Math.min(100, state.fanApproval + approvalChange)),
      revenue: 100 + userRecord.wins * 2,
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
        week: 24,
        season: state.currentSeason,
        title: 'Season Complete!',
        body: `The ${state.currentSeason} season has concluded. Your record: ${userRecord.wins}-${userRecord.losses}.`,
        type: 'season',
        teamIds: [state.teamId],
      },
      {
        id: `news-champion-${state.currentSeason}`,
        week: 24,
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
        week: 24,
        season: state.currentSeason,
        title: `${mvp.name} named MVP!`,
        body: `${mvp.name} has been named the Most Valuable Player for the season.`,
        type: 'season',
        teamIds: [mvp.teamId],
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
