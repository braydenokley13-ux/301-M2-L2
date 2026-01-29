import { Player, Team, FreeAgent } from '../data/types';

export function generateFreeAgents(count: number = 30): FreeAgent[] {
  const positions: Array<Player['position']> = ['PG', 'SG', 'SF', 'PF', 'C'];
  const firstNames = ['Marcus', 'Tyler', 'Chris', 'DeAndre', 'Kevin', 'Mike', 'Tony', 'David', 'Ryan', 'Alex',
    'Jordan', 'Isaiah', 'Malik', 'Cam', 'Tre', 'Zach', 'Devon', 'TJ', 'Reggie', 'Kyle',
    'Brandon', 'Andre', 'Darius', 'Xavier', 'Jaylen', 'Terrence', 'Marvin', 'Wesley', 'Rodney', 'Gary'];
  const lastNames = ['Williams', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Thomas', 'Jackson', 'White',
    'Harris', 'Martin', 'Thompson', 'Garcia', 'Robinson', 'Clark', 'Lewis', 'Walker', 'Allen', 'King',
    'Scott', 'Green', 'Baker', 'Hill', 'Adams', 'Nelson', 'Mitchell', 'Roberts', 'Carter', 'Turner'];

  const agents: FreeAgent[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const age = 22 + Math.floor(Math.random() * 14);
    const overall = 62 + Math.floor(Math.random() * 22);
    const potential = Math.min(99, overall + Math.floor(Math.random() * (age < 26 ? 12 : 5)));

    const player: Player = {
      id: `fa-${i}`,
      name,
      position: positions[Math.floor(Math.random() * positions.length)],
      age,
      overallRating: overall,
      potential,
      offense: Math.min(99, Math.max(40, overall + Math.floor((Math.random() - 0.5) * 10))),
      defense: Math.min(99, Math.max(40, overall + Math.floor((Math.random() - 0.5) * 10))),
      athleticism: Math.min(99, Math.max(40, overall + Math.floor((Math.random() - 0.5) * 15))),
      basketball_iq: Math.min(99, Math.max(40, overall + Math.floor((Math.random() - 0.3) * 10))),
      durability: 60 + Math.floor(Math.random() * 35),
      salary: 0,
      contractYears: 0,
      teamId: '',
      isStarter: overall >= 75,
      isStar: overall >= 85,
      morale: 70 + Math.floor(Math.random() * 20),
      experience: Math.max(1, age - 19 - Math.floor(Math.random() * 3)),
    };

    const askingPrice = Math.max(2, Math.round((overall - 60) * 0.8 + (potential - overall) * 0.3));
    const yearsWanted = age > 32 ? 1 : age > 28 ? 2 : 3;

    agents.push({
      player,
      askingPrice,
      interestLevel: {},
      yearsWanted,
    });
  }

  return agents.sort((a, b) => b.player.overallRating - a.player.overallRating);
}

export function calculatePlayerInterest(
  player: Player,
  team: Team,
  offerSalary: number,
  askingPrice: number,
): number {
  let interest = 50;

  // Salary fit
  const salaryRatio = offerSalary / askingPrice;
  if (salaryRatio >= 1.2) interest += 25;
  else if (salaryRatio >= 1.0) interest += 15;
  else if (salaryRatio >= 0.8) interest += 5;
  else interest -= 15;

  // Contention - team strength
  const teamWinPct = team.wins / Math.max(1, team.wins + team.losses);
  if (teamWinPct > 0.6) interest += 15;
  else if (teamWinPct > 0.5) interest += 5;
  else interest -= 10;

  // Market size
  if (team.marketSize === 'large') interest += 10;
  else if (team.marketSize === 'medium') interest += 3;
  else interest -= 5;

  // Role clarity
  const samePosition = team.roster.filter(p => p.position === player.position);
  if (samePosition.length < 2) interest += 10;
  if (samePosition.every(p => p.overallRating < player.overallRating)) interest += 10;

  // Prestige bonus
  interest += Math.floor(team.prestige / 20);

  return Math.max(0, Math.min(100, interest));
}

export function signFreeAgent(
  freeAgent: FreeAgent,
  team: Team,
  salary: number,
  years: number,
): Player {
  return {
    ...freeAgent.player,
    teamId: team.id,
    salary,
    contractYears: years,
    isStarter: freeAgent.player.overallRating > 75,
  };
}

export function willAcceptOffer(
  interest: number,
  difficulty: 'easy' | 'medium' | 'hard',
): boolean {
  const threshold = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 55 : 65;
  return interest >= threshold;
}
