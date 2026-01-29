import { Team, Player, SimulatedGame, SimulationWeek, InjuryEvent, NewsItem, PlayoffResult } from '../data/types';

function getTeamStrength(team: Team): number {
  if (team.roster.length === 0) return 50;
  const starters = team.roster.filter(p => p.isStarter);
  const bench = team.roster.filter(p => !p.isStarter);

  const starterAvg = starters.length > 0
    ? starters.reduce((sum, p) => sum + p.overallRating, 0) / starters.length
    : 60;
  const benchAvg = bench.length > 0
    ? bench.reduce((sum, p) => sum + p.overallRating, 0) / bench.length
    : 55;

  const starBonus = team.roster.filter(p => p.isStar).length * 2;
  const depthBonus = Math.min(team.roster.length, 12) * 0.5;

  return starterAvg * 0.7 + benchAvg * 0.3 + starBonus + depthBonus;
}

function simulateGame(homeTeam: Team, awayTeam: Team, momentum: Record<string, number>): SimulatedGame {
  const homeStrength = getTeamStrength(homeTeam) + 3; // home court advantage
  const awayStrength = getTeamStrength(awayTeam);

  const homeMomentum = (momentum[homeTeam.id] || 0) * 0.5;
  const awayMomentum = (momentum[awayTeam.id] || 0) * 0.5;

  const homeAdj = homeStrength + homeMomentum + (Math.random() - 0.5) * 20;
  const awayAdj = awayStrength + awayMomentum + (Math.random() - 0.5) * 20;

  const baseScore = 95;
  const homeScore = Math.round(baseScore + (homeAdj - 70) * 0.5 + (Math.random() - 0.5) * 15);
  const awayScore = Math.round(baseScore + (awayAdj - 70) * 0.5 + (Math.random() - 0.5) * 15);

  const finalHomeScore = Math.max(80, homeScore);
  let finalAwayScore = Math.max(80, awayScore);

  // no ties
  if (finalHomeScore === finalAwayScore) {
    finalAwayScore += Math.random() > 0.5 ? 1 : -1;
  }

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore: finalHomeScore,
    awayScore: Math.max(80, finalAwayScore),
    winnerId: finalHomeScore > finalAwayScore ? homeTeam.id : awayTeam.id,
  };
}

function checkInjuries(teams: Team[], week: number): InjuryEvent[] {
  const injuries: InjuryEvent[] = [];
  for (const team of teams) {
    for (const player of team.roster) {
      const injuryChance = (100 - player.durability) / 5000;
      if (Math.random() < injuryChance) {
        const severity = Math.random();
        let type: InjuryEvent['severity'];
        let weeksOut: number;
        if (severity < 0.5) { type = 'minor'; weeksOut = 1; }
        else if (severity < 0.8) { type = 'moderate'; weeksOut = 2 + Math.floor(Math.random() * 3); }
        else if (severity < 0.95) { type = 'major'; weeksOut = 6 + Math.floor(Math.random() * 6); }
        else { type = 'season_ending'; weeksOut = 24; }

        injuries.push({ playerId: player.id, teamId: team.id, severity: type, weeksOut });
      }
    }
  }
  return injuries;
}

function generateSchedule(teams: Team[]): Array<{ home: string; away: string }[]> {
  const weeks: Array<{ home: string; away: string }[]> = [];
  const teamIds = teams.map(t => t.id);

  for (let week = 0; week < 24; week++) {
    const weekGames: { home: string; away: string }[] = [];
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      weekGames.push({
        home: shuffled[i],
        away: shuffled[i + 1],
      });
    }
    weeks.push(weekGames);
  }
  return weeks;
}

export function simulateRegularSeason(teams: Team[]): {
  results: SimulationWeek[];
  standings: Record<string, { wins: number; losses: number }>;
} {
  const schedule = generateSchedule(teams);
  const standings: Record<string, { wins: number; losses: number }> = {};
  const momentum: Record<string, number> = {};
  const results: SimulationWeek[] = [];

  for (const team of teams) {
    standings[team.id] = { wins: 0, losses: 0 };
    momentum[team.id] = 0;
  }

  const teamMap = new Map(teams.map(t => [t.id, t]));

  for (let week = 0; week < schedule.length; week++) {
    const weekGames: SimulatedGame[] = [];
    const injuries = checkInjuries(teams, week);
    const news: NewsItem[] = [];

    for (const matchup of schedule[week]) {
      const home = teamMap.get(matchup.home)!;
      const away = teamMap.get(matchup.away)!;
      const game = simulateGame(home, away, momentum);
      weekGames.push(game);

      standings[game.winnerId].wins++;
      const loserId = game.winnerId === game.homeTeamId ? game.awayTeamId : game.homeTeamId;
      standings[loserId].losses++;

      // Update momentum
      momentum[game.winnerId] = Math.min(10, (momentum[game.winnerId] || 0) + 1);
      momentum[loserId] = Math.max(-10, (momentum[loserId] || 0) - 1);
    }

    for (const injury of injuries) {
      const player = teams.flatMap(t => t.roster).find(p => p.id === injury.playerId);
      if (player) {
        news.push({
          id: `news-inj-${week}-${injury.playerId}`,
          week: week + 1,
          season: 1,
          title: `${player.name} injured`,
          body: `${player.name} suffers a ${injury.severity} injury and will miss ${injury.weeksOut} week(s).`,
          type: 'injury',
          teamIds: [injury.teamId],
        });
      }
    }

    results.push({ week: week + 1, games: weekGames, injuries, news });
  }

  return { results, standings };
}

export function simulatePlayoffs(teams: Team[], standings: Record<string, { wins: number; losses: number }>): {
  bracket: PlayoffBracketRound[];
  champion: string;
  results: Record<string, PlayoffResult>;
} {
  // Get top 8 from each conference
  const eastern = teams.filter(t => t.conference === 'Eastern')
    .sort((a, b) => (standings[b.id]?.wins || 0) - (standings[a.id]?.wins || 0))
    .slice(0, 8);
  const western = teams.filter(t => t.conference === 'Western')
    .sort((a, b) => (standings[b.id]?.wins || 0) - (standings[a.id]?.wins || 0))
    .slice(0, 8);

  const results: Record<string, PlayoffResult> = {};
  teams.forEach(t => { results[t.id] = 'missed'; });

  // Mark all playoff teams
  [...eastern, ...western].forEach(t => { results[t.id] = 'first_round'; });

  const bracket: PlayoffBracketRound[] = [];
  const teamMap = new Map(teams.map(t => [t.id, t]));

  function simulateSeries(team1Id: string, team2Id: string): string {
    const t1 = teamMap.get(team1Id)!;
    const t2 = teamMap.get(team2Id)!;
    let t1Wins = 0, t2Wins = 0;
    const momentum: Record<string, number> = { [team1Id]: 0, [team2Id]: 0 };

    while (t1Wins < 4 && t2Wins < 4) {
      const game = simulateGame(t1, t2, momentum);
      if (game.winnerId === team1Id) t1Wins++;
      else t2Wins++;
    }
    return t1Wins > t2Wins ? team1Id : team2Id;
  }

  // First round
  const firstRoundMatchups: [string, string][] = [];
  for (let i = 0; i < 4; i++) {
    firstRoundMatchups.push([eastern[i].id, eastern[7 - i].id]);
    firstRoundMatchups.push([western[i].id, western[7 - i].id]);
  }

  const firstRoundWinners: string[] = [];
  const firstRound: PlayoffBracketMatchup[] = [];
  for (const [t1, t2] of firstRoundMatchups) {
    const winner = simulateSeries(t1, t2);
    firstRoundWinners.push(winner);
    firstRound.push({ team1Id: t1, team2Id: t2, winnerId: winner });
  }
  bracket.push({ round: 'First Round', matchups: firstRound });

  // Mark second round teams
  firstRoundWinners.forEach(id => { results[id] = 'second_round'; });

  // Second round
  const secondRoundWinners: string[] = [];
  const secondRound: PlayoffBracketMatchup[] = [];
  for (let i = 0; i < firstRoundWinners.length; i += 2) {
    const winner = simulateSeries(firstRoundWinners[i], firstRoundWinners[i + 1]);
    secondRoundWinners.push(winner);
    secondRound.push({ team1Id: firstRoundWinners[i], team2Id: firstRoundWinners[i + 1], winnerId: winner });
  }
  bracket.push({ round: 'Conference Semifinals', matchups: secondRound });

  secondRoundWinners.forEach(id => { results[id] = 'conference_finals'; });

  // Conference finals
  const confFinalsWinners: string[] = [];
  const confFinals: PlayoffBracketMatchup[] = [];
  for (let i = 0; i < secondRoundWinners.length; i += 2) {
    const winner = simulateSeries(secondRoundWinners[i], secondRoundWinners[i + 1]);
    confFinalsWinners.push(winner);
    confFinals.push({ team1Id: secondRoundWinners[i], team2Id: secondRoundWinners[i + 1], winnerId: winner });
  }
  bracket.push({ round: 'Conference Finals', matchups: confFinals });

  confFinalsWinners.forEach(id => { results[id] = 'finals'; });

  // Finals
  const champion = simulateSeries(confFinalsWinners[0], confFinalsWinners[1]);
  bracket.push({
    round: 'NBA Finals',
    matchups: [{ team1Id: confFinalsWinners[0], team2Id: confFinalsWinners[1], winnerId: champion }],
  });
  results[champion] = 'champion';

  return { bracket, champion, results };
}

export interface PlayoffBracketRound {
  round: string;
  matchups: PlayoffBracketMatchup[];
}

export interface PlayoffBracketMatchup {
  team1Id: string;
  team2Id: string;
  winnerId: string;
}

export function getSeasonMVP(teams: Team[]): Player | null {
  const allPlayers = teams.flatMap(t => t.roster);
  if (allPlayers.length === 0) return null;

  return allPlayers
    .filter(p => p.isStarter)
    .sort((a, b) => {
      const aScore = a.overallRating * 1.2 + (a.isStar ? 10 : 0);
      const bScore = b.overallRating * 1.2 + (b.isStar ? 10 : 0);
      return bScore - aScore;
    })[0] || null;
}
