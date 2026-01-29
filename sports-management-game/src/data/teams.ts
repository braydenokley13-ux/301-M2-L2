import { Team, TeamContextType, Conference, Division } from './types';

interface TeamSeed {
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
  fanbase: number;
  prestige: number;
  baseWins: number;
}

export const TEAM_SEEDS: TeamSeed[] = [
  // Eastern Conference - Atlantic
  { id: 'bos', name: 'Celtics', city: 'Boston', abbreviation: 'BOS', conference: 'Eastern', division: 'Atlantic', contextType: 'legacy_power', primaryColor: '#007A33', secondaryColor: '#BA9653', marketSize: 'large', fanbase: 90, prestige: 95, baseWins: 55 },
  { id: 'bkn', name: 'Nets', city: 'Brooklyn', abbreviation: 'BKN', conference: 'Eastern', division: 'Atlantic', contextType: 'cash_rich_expansion', primaryColor: '#000000', secondaryColor: '#FFFFFF', marketSize: 'large', fanbase: 60, prestige: 55, baseWins: 32 },
  { id: 'nyk', name: 'Knicks', city: 'New York', abbreviation: 'NYK', conference: 'Eastern', division: 'Atlantic', contextType: 'legacy_power', primaryColor: '#006BB6', secondaryColor: '#F58426', marketSize: 'large', fanbase: 92, prestige: 80, baseWins: 48 },
  { id: 'phi', name: '76ers', city: 'Philadelphia', abbreviation: 'PHI', conference: 'Eastern', division: 'Atlantic', contextType: 'star_dependent', primaryColor: '#006BB6', secondaryColor: '#ED174C', marketSize: 'large', fanbase: 75, prestige: 70, baseWins: 42 },
  { id: 'tor', name: 'Raptors', city: 'Toronto', abbreviation: 'TOR', conference: 'Eastern', division: 'Atlantic', contextType: 'small_market_reset', primaryColor: '#CE1141', secondaryColor: '#000000', marketSize: 'medium', fanbase: 70, prestige: 65, baseWins: 30 },

  // Eastern Conference - Central
  { id: 'chi', name: 'Bulls', city: 'Chicago', abbreviation: 'CHI', conference: 'Eastern', division: 'Central', contextType: 'legacy_power', primaryColor: '#CE1141', secondaryColor: '#000000', marketSize: 'large', fanbase: 85, prestige: 85, baseWins: 38 },
  { id: 'cle', name: 'Cavaliers', city: 'Cleveland', abbreviation: 'CLE', conference: 'Eastern', division: 'Central', contextType: 'small_market_reset', primaryColor: '#860038', secondaryColor: '#041E42', marketSize: 'small', fanbase: 60, prestige: 60, baseWins: 48 },
  { id: 'det', name: 'Pistons', city: 'Detroit', abbreviation: 'DET', conference: 'Eastern', division: 'Central', contextType: 'revenue_sensitive', primaryColor: '#C8102E', secondaryColor: '#1D42BA', marketSize: 'medium', fanbase: 50, prestige: 55, baseWins: 25 },
  { id: 'ind', name: 'Pacers', city: 'Indiana', abbreviation: 'IND', conference: 'Eastern', division: 'Central', contextType: 'small_market_reset', primaryColor: '#002D62', secondaryColor: '#FDBB30', marketSize: 'small', fanbase: 55, prestige: 55, baseWins: 45 },
  { id: 'mil', name: 'Bucks', city: 'Milwaukee', abbreviation: 'MIL', conference: 'Eastern', division: 'Central', contextType: 'star_dependent', primaryColor: '#00471B', secondaryColor: '#EEE1C6', marketSize: 'small', fanbase: 65, prestige: 75, baseWins: 49 },

  // Eastern Conference - Southeast
  { id: 'atl', name: 'Hawks', city: 'Atlanta', abbreviation: 'ATL', conference: 'Eastern', division: 'Southeast', contextType: 'revenue_sensitive', primaryColor: '#E03A3E', secondaryColor: '#C1D32F', marketSize: 'medium', fanbase: 50, prestige: 50, baseWins: 36 },
  { id: 'cha', name: 'Hornets', city: 'Charlotte', abbreviation: 'CHA', conference: 'Eastern', division: 'Southeast', contextType: 'revenue_sensitive', primaryColor: '#1D1160', secondaryColor: '#00788C', marketSize: 'small', fanbase: 40, prestige: 35, baseWins: 24 },
  { id: 'mia', name: 'Heat', city: 'Miami', abbreviation: 'MIA', conference: 'Eastern', division: 'Southeast', contextType: 'legacy_power', primaryColor: '#98002E', secondaryColor: '#F9A01B', marketSize: 'large', fanbase: 80, prestige: 85, baseWins: 44 },
  { id: 'orl', name: 'Magic', city: 'Orlando', abbreviation: 'ORL', conference: 'Eastern', division: 'Southeast', contextType: 'small_market_reset', primaryColor: '#0077C0', secondaryColor: '#C4CED4', marketSize: 'small', fanbase: 45, prestige: 45, baseWins: 42 },
  { id: 'was', name: 'Wizards', city: 'Washington', abbreviation: 'WAS', conference: 'Eastern', division: 'Southeast', contextType: 'revenue_sensitive', primaryColor: '#002B5C', secondaryColor: '#E31837', marketSize: 'medium', fanbase: 45, prestige: 40, baseWins: 22 },

  // Western Conference - Northwest
  { id: 'den', name: 'Nuggets', city: 'Denver', abbreviation: 'DEN', conference: 'Western', division: 'Northwest', contextType: 'star_dependent', primaryColor: '#0E2240', secondaryColor: '#FEC524', marketSize: 'medium', fanbase: 60, prestige: 75, baseWins: 50 },
  { id: 'min', name: 'Timberwolves', city: 'Minnesota', abbreviation: 'MIN', conference: 'Western', division: 'Northwest', contextType: 'small_market_reset', primaryColor: '#0C2340', secondaryColor: '#236192', marketSize: 'small', fanbase: 50, prestige: 45, baseWins: 46 },
  { id: 'okc', name: 'Thunder', city: 'Oklahoma City', abbreviation: 'OKC', conference: 'Western', division: 'Northwest', contextType: 'small_market_reset', primaryColor: '#007AC1', secondaryColor: '#EF6100', marketSize: 'small', fanbase: 65, prestige: 70, baseWins: 57 },
  { id: 'por', name: 'Trail Blazers', city: 'Portland', abbreviation: 'POR', conference: 'Western', division: 'Northwest', contextType: 'revenue_sensitive', primaryColor: '#E03A3E', secondaryColor: '#000000', marketSize: 'small', fanbase: 55, prestige: 50, baseWins: 24 },
  { id: 'uta', name: 'Jazz', city: 'Utah', abbreviation: 'UTA', conference: 'Western', division: 'Northwest', contextType: 'small_market_reset', primaryColor: '#002B5C', secondaryColor: '#00471B', marketSize: 'small', fanbase: 50, prestige: 50, baseWins: 28 },

  // Western Conference - Pacific
  { id: 'gsw', name: 'Warriors', city: 'Golden State', abbreviation: 'GSW', conference: 'Western', division: 'Pacific', contextType: 'legacy_power', primaryColor: '#1D428A', secondaryColor: '#FFC72C', marketSize: 'large', fanbase: 90, prestige: 92, baseWins: 42 },
  { id: 'lac', name: 'Clippers', city: 'Los Angeles', abbreviation: 'LAC', conference: 'Western', division: 'Pacific', contextType: 'cash_rich_expansion', primaryColor: '#C8102E', secondaryColor: '#1D428A', marketSize: 'large', fanbase: 50, prestige: 55, baseWins: 38 },
  { id: 'lal', name: 'Lakers', city: 'Los Angeles', abbreviation: 'LAL', conference: 'Western', division: 'Pacific', contextType: 'legacy_power', primaryColor: '#552583', secondaryColor: '#FDB927', marketSize: 'large', fanbase: 95, prestige: 98, baseWins: 42 },
  { id: 'phx', name: 'Suns', city: 'Phoenix', abbreviation: 'PHX', conference: 'Western', division: 'Pacific', contextType: 'star_dependent', primaryColor: '#1D1160', secondaryColor: '#E56020', marketSize: 'medium', fanbase: 60, prestige: 60, baseWins: 40 },
  { id: 'sac', name: 'Kings', city: 'Sacramento', abbreviation: 'SAC', conference: 'Western', division: 'Pacific', contextType: 'revenue_sensitive', primaryColor: '#5A2D81', secondaryColor: '#63727A', marketSize: 'small', fanbase: 50, prestige: 40, baseWins: 40 },

  // Western Conference - Southwest
  { id: 'dal', name: 'Mavericks', city: 'Dallas', abbreviation: 'DAL', conference: 'Western', division: 'Southwest', contextType: 'star_dependent', primaryColor: '#00538C', secondaryColor: '#002B5E', marketSize: 'large', fanbase: 70, prestige: 70, baseWins: 48 },
  { id: 'hou', name: 'Rockets', city: 'Houston', abbreviation: 'HOU', conference: 'Western', division: 'Southwest', contextType: 'small_market_reset', primaryColor: '#CE1141', secondaryColor: '#000000', marketSize: 'large', fanbase: 60, prestige: 60, baseWins: 38 },
  { id: 'mem', name: 'Grizzlies', city: 'Memphis', abbreviation: 'MEM', conference: 'Western', division: 'Southwest', contextType: 'small_market_reset', primaryColor: '#5D76A9', secondaryColor: '#12173F', marketSize: 'small', fanbase: 55, prestige: 55, baseWins: 44 },
  { id: 'nop', name: 'Pelicans', city: 'New Orleans', abbreviation: 'NOP', conference: 'Western', division: 'Southwest', contextType: 'revenue_sensitive', primaryColor: '#0C2340', secondaryColor: '#C8102E', marketSize: 'small', fanbase: 40, prestige: 40, baseWins: 30 },
  { id: 'sas', name: 'Spurs', city: 'San Antonio', abbreviation: 'SAS', conference: 'Western', division: 'Southwest', contextType: 'small_market_reset', primaryColor: '#C4CED4', secondaryColor: '#000000', marketSize: 'small', fanbase: 65, prestige: 80, baseWins: 35 },
];

export function createTeamFromSeed(seed: TeamSeed): Team {
  return {
    ...seed,
    salaryCap: 140,
    totalSalary: 0,
    wins: 0,
    losses: 0,
    roster: [],
    draftPicks: [
      { id: `${seed.id}-r1-1`, year: 1, round: 1, originalTeamId: seed.id, currentTeamId: seed.id },
      { id: `${seed.id}-r2-1`, year: 1, round: 2, originalTeamId: seed.id, currentTeamId: seed.id },
      { id: `${seed.id}-r1-2`, year: 2, round: 1, originalTeamId: seed.id, currentTeamId: seed.id },
      { id: `${seed.id}-r2-2`, year: 2, round: 2, originalTeamId: seed.id, currentTeamId: seed.id },
    ],
  };
}

export function initializeAllTeams(): Team[] {
  return TEAM_SEEDS.map(createTeamFromSeed);
}
