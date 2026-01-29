import { DraftProspect, Position, Team, Player } from '../data/types';

const FIRST_NAMES = [
  'Jaylen', 'Marcus', 'Zion', 'Trey', 'Devin', 'Kyler', 'Jaden', 'Terrell',
  'Darius', 'Xavier', 'Cam', 'Malik', 'Aiden', 'Bryce', 'Carter', 'Ethan',
  'Liam', 'Noah', 'Elijah', 'Isaiah', 'Rashad', 'Donovan', 'Tyrese', 'Immanuel',
  'Keon', 'Jabari', 'Cade', 'Jalen', 'Scoot', 'Ausar', 'Amen', 'Brandon',
  'Cooper', 'Reed', 'Dalton', 'Alex', 'Ryan', 'Nolan', 'Brice', 'Matas',
  'Nikola', 'Zan', 'Yuki', 'Lei', 'Oumar', 'Mamadi', 'Sidy', 'Kai',
  'Toumani', 'Ibrahima', 'Kobe', 'Shaq', 'Chris', 'Derrick', 'Russell', 'Kevin',
  'Shane', 'Jayce', 'Colby', 'Trent',
];

const LAST_NAMES = [
  'Williams', 'Johnson', 'Smith', 'Brown', 'Davis', 'Wilson', 'Anderson',
  'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson',
  'Moore', 'Allen', 'Young', 'King', 'Wright', 'Scott', 'Hill', 'Green',
  'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner',
  'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart',
  'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey',
  'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Peterson',
  'Diallo', 'Mbaye', 'Kouame', 'Okafor', 'Adebayo', 'Okeke', 'Nwora',
  'Banchero', 'Wagner', 'Doncic',
];

const COLLEGES = [
  'Duke', 'Kentucky', 'North Carolina', 'Kansas', 'Gonzaga', 'Michigan',
  'UCLA', 'Villanova', 'UConn', 'Arizona', 'Baylor', 'Auburn', 'Tennessee',
  'Indiana', 'Memphis', 'G League Ignite', 'Overtime Elite', 'NBL Australia',
  'FC Barcelona', 'Real Madrid', 'Mega Basket', 'International',
  'Arkansas', 'Texas', 'Houston', 'Purdue', 'Creighton', 'Alabama',
  'Illinois', 'Oregon', 'USC', 'Georgetown', 'Marquette', 'Ohio State',
];

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export function generateDraftClass(size: number = 60): DraftProspect[] {
  const usedNames = new Set<string>();
  const prospects: DraftProspect[] = [];

  for (let i = 0; i < size; i++) {
    let name: string;
    do {
      name = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const tier = i < 5 ? 'lottery_top' : i < 14 ? 'lottery' : i < 30 ? 'first_round' : 'second_round';
    const age = 19 + Math.floor(Math.random() * 4);

    let baseRating: number;
    let potentialRange: [number, number];
    let varianceRange: [number, number];

    switch (tier) {
      case 'lottery_top':
        baseRating = 72 + Math.floor(Math.random() * 8);
        potentialRange = [85, 96];
        varianceRange = [5, 15];
        break;
      case 'lottery':
        baseRating = 66 + Math.floor(Math.random() * 8);
        potentialRange = [78, 90];
        varianceRange = [8, 18];
        break;
      case 'first_round':
        baseRating = 60 + Math.floor(Math.random() * 8);
        potentialRange = [70, 84];
        varianceRange = [10, 20];
        break;
      default:
        baseRating = 52 + Math.floor(Math.random() * 10);
        potentialRange = [62, 78];
        varianceRange = [12, 25];
    }

    const potential = potentialRange[0] + Math.floor(Math.random() * (potentialRange[1] - potentialRange[0]));
    const variance = varianceRange[0] + Math.floor(Math.random() * (varianceRange[1] - varianceRange[0]));
    const floor = Math.max(45, baseRating - variance);
    const ceiling = Math.min(99, potential + Math.floor(variance * 0.5));

    prospects.push({
      id: `prospect-${i}`,
      name,
      position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
      age,
      college: COLLEGES[Math.floor(Math.random() * COLLEGES.length)],
      overallRating: baseRating,
      potential,
      floor,
      ceiling,
      variance,
      offense: Math.min(99, Math.max(40, baseRating + Math.floor((Math.random() - 0.5) * 12))),
      defense: Math.min(99, Math.max(40, baseRating + Math.floor((Math.random() - 0.5) * 12))),
      athleticism: Math.min(99, Math.max(40, baseRating + Math.floor((Math.random() - 0.5) * 16))),
      basketball_iq: Math.min(99, Math.max(40, baseRating + Math.floor((Math.random() - 0.3) * 10))),
    });
  }

  return prospects.sort((a, b) => {
    const aScore = a.overallRating * 0.4 + a.potential * 0.6;
    const bScore = b.overallRating * 0.4 + b.potential * 0.6;
    return bScore - aScore;
  });
}

export function draftProspectToPlayer(prospect: DraftProspect, teamId: string): Player {
  // Apply some randomness based on variance
  const actualRating = Math.round(
    prospect.floor + Math.random() * (prospect.ceiling - prospect.floor) * 0.3
  );

  return {
    id: `drafted-${prospect.id}`,
    name: prospect.name,
    position: prospect.position,
    age: prospect.age,
    overallRating: Math.max(prospect.floor, Math.min(prospect.ceiling, actualRating)),
    potential: prospect.potential,
    offense: prospect.offense,
    defense: prospect.defense,
    athleticism: prospect.athleticism,
    basketball_iq: prospect.basketball_iq,
    durability: 60 + Math.floor(Math.random() * 30),
    salary: 5 + Math.floor((60 - Math.min(60, prospects_rank(prospect))) * 0.15),
    contractYears: 4,
    teamId,
    isStarter: false,
    isStar: false,
    morale: 80,
    experience: 0,
  };
}

function prospects_rank(prospect: DraftProspect): number {
  return parseInt(prospect.id.split('-')[1]) || 30;
}

export function aiDraftPick(
  team: Team,
  availableProspects: DraftProspect[],
): DraftProspect | null {
  if (availableProspects.length === 0) return null;

  // AI picks based on team needs and best available
  const positionNeeds = getPositionNeeds(team);

  const scored = availableProspects.map(p => {
    const baseScore = p.overallRating * 0.4 + p.potential * 0.6;
    const needBonus = positionNeeds.includes(p.position) ? 5 : 0;
    return { prospect: p, score: baseScore + needBonus };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.prospect || null;
}

function getPositionNeeds(team: Team): Position[] {
  const positionCount: Record<Position, number> = { PG: 0, SG: 0, SF: 0, PF: 0, C: 0 };
  team.roster.forEach(p => { positionCount[p.position]++; });

  const needs: Position[] = [];
  for (const [pos, count] of Object.entries(positionCount)) {
    if (count < 2) needs.push(pos as Position);
  }
  return needs;
}
