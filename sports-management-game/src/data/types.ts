// Core game types

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type TeamContextType = 'legacy_power' | 'small_market_reset' | 'revenue_sensitive' | 'cash_rich_expansion' | 'star_dependent';
export type StrategyType = 'stability_first' | 'aggressive_push' | 'boom_bust_swing';
export type MoveType = 'trade' | 'free_agency' | 'draft' | 'waive' | 'extend';
export type PlayoffResult = 'missed' | 'first_round' | 'second_round' | 'conference_finals' | 'finals' | 'champion';
export type Conference = 'Eastern' | 'Western';
export type Division = 'Atlantic' | 'Central' | 'Southeast' | 'Northwest' | 'Pacific' | 'Southwest';

export interface Player {
  id: string;
  name: string;
  position: Position;
  age: number;
  overallRating: number;
  potential: number;
  offense: number;
  defense: number;
  athleticism: number;
  basketball_iq: number;
  durability: number;
  salary: number; // in millions
  contractYears: number;
  teamId: string;
  isStarter: boolean;
  isStar: boolean;
  morale: number; // 0-100
  experience: number; // years in league
}

export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  conference: Conference;
  division: Division;
  contextType: TeamContextType;
  primaryColor: string;
  secondaryColor: string;
  marketSize: 'large' | 'medium' | 'small';
  fanbase: number; // 0-100
  prestige: number; // 0-100
  salaryCap: number; // in millions
  totalSalary: number;
  wins: number;
  losses: number;
  roster: Player[];
  draftPicks: DraftPick[];
}

export interface DraftPick {
  id: string;
  year: number;
  round: 1 | 2;
  originalTeamId: string;
  currentTeamId: string;
  projectedPosition?: number;
}

export interface DraftProspect {
  id: string;
  name: string;
  position: Position;
  age: number;
  college: string;
  overallRating: number;
  potential: number;
  floor: number;
  ceiling: number;
  variance: number;
  offense: number;
  defense: number;
  athleticism: number;
  basketball_iq: number;
}

export interface TradeProposal {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  playersOffered: string[]; // player IDs
  playersRequested: string[]; // player IDs
  picksOffered: string[]; // pick IDs
  picksRequested: string[]; // pick IDs
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  fairnessScore: number; // -100 to 100
}

export interface FreeAgent {
  player: Player;
  askingPrice: number; // per year in millions
  interestLevel: Record<string, number>; // teamId -> interest score
  yearsWanted: number;
}

export interface TeamContext {
  type: TeamContextType;
  label: string;
  description: string;
  fanPatience: number; // 1-10, higher = more patient
  mediaPressure: number; // multiplier
  revenueVolatility: number;
  ownershipRiskTolerance: number;
  brandValueAtRisk: number;
}

export interface Strategy {
  type: StrategyType;
  label: string;
  description: string;
  tradeRisk: number;
  draftPickProtection: boolean;
  outcomeVariance: number;
  championshipBonus: number;
  winNowOrientation: number;
  youthDevelopment: number;
}

export interface GameState {
  userId: string;
  teamId: string;
  currentSeason: number;
  currentWeek: number;
  phase: 'team_selection' | 'offseason_free_agency' | 'offseason_draft' | 'preseason' | 'regular_season' | 'playoffs' | 'season_end';
  strategy: StrategyType;
  salaryCap: number;
  salaryCapSpace: number;
  fanApproval: number; // 0-100
  ownerConfidence: number; // 0-100
  mediaRating: number; // 0-100
  gmLevel: number;
  gmExperience: number;
  achievements: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  teams: Team[];
  freeAgents: FreeAgent[];
  draftProspects: DraftProspect[];
  tradeHistory: TradeProposal[];
  seasonResults: SeasonResult[];
  newsLog: NewsItem[];
  momentum: number; // -50 to 50
}

export interface SeasonResult {
  season: number;
  wins: number;
  losses: number;
  playoffResult: PlayoffResult;
  mvp: string;
  bestPlayer: string;
  fanApproval: number;
  revenue: number;
}

export interface NewsItem {
  id: string;
  week: number;
  season: number;
  title: string;
  body: string;
  type: 'trade' | 'injury' | 'milestone' | 'draft' | 'free_agency' | 'season' | 'general';
  teamIds: string[];
}

export interface SimulationWeek {
  week: number;
  games: SimulatedGame[];
  injuries: InjuryEvent[];
  news: NewsItem[];
}

export interface SimulatedGame {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  winnerId: string;
}

export interface InjuryEvent {
  playerId: string;
  teamId: string;
  severity: 'minor' | 'moderate' | 'major' | 'season_ending';
  weeksOut: number;
}
