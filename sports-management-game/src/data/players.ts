import { Player, Position } from './types';

interface PlayerSeed {
  name: string;
  position: Position;
  age: number;
  overallRating: number;
  potential: number;
  salary: number;
  contractYears: number;
  teamId: string;
  isStarter: boolean;
  isStar: boolean;
}

let playerIdCounter = 1;
function pid(): string {
  return `p${playerIdCounter++}`;
}

function createPlayer(seed: PlayerSeed): Player {
  const off = seed.overallRating + Math.floor((Math.random() - 0.5) * 10);
  const def = seed.overallRating + Math.floor((Math.random() - 0.5) * 10);
  return {
    id: pid(),
    name: seed.name,
    position: seed.position,
    age: seed.age,
    overallRating: seed.overallRating,
    potential: seed.potential,
    offense: Math.min(99, Math.max(40, off)),
    defense: Math.min(99, Math.max(40, def)),
    athleticism: Math.min(99, Math.max(40, seed.overallRating + Math.floor((Math.random() - 0.5) * 15))),
    basketball_iq: Math.min(99, Math.max(40, seed.overallRating + Math.floor((Math.random() - 0.3) * 10))),
    durability: Math.floor(60 + Math.random() * 35),
    salary: seed.salary,
    contractYears: seed.contractYears,
    teamId: seed.teamId,
    isStarter: seed.isStarter,
    isStar: seed.isStar,
    morale: 70 + Math.floor(Math.random() * 20),
    experience: Math.max(1, seed.age - 19),
  };
}

const PLAYER_SEEDS: PlayerSeed[] = [
  // Boston Celtics
  { name: 'Jayson Tatum', position: 'SF', age: 27, overallRating: 93, potential: 95, salary: 54, contractYears: 4, teamId: 'bos', isStarter: true, isStar: true },
  { name: 'Jaylen Brown', position: 'SG', age: 28, overallRating: 88, potential: 89, salary: 49, contractYears: 3, teamId: 'bos', isStarter: true, isStar: true },
  { name: 'Derrick White', position: 'PG', age: 30, overallRating: 80, potential: 80, salary: 20, contractYears: 3, teamId: 'bos', isStarter: true, isStar: false },
  { name: 'Kristaps Porzingis', position: 'C', age: 29, overallRating: 85, potential: 85, salary: 30, contractYears: 2, teamId: 'bos', isStarter: true, isStar: true },
  { name: 'Jrue Holiday', position: 'PG', age: 34, overallRating: 82, potential: 82, salary: 30, contractYears: 2, teamId: 'bos', isStarter: true, isStar: false },
  { name: 'Al Horford', position: 'C', age: 38, overallRating: 74, potential: 74, salary: 10, contractYears: 1, teamId: 'bos', isStarter: false, isStar: false },
  { name: 'Payton Pritchard', position: 'PG', age: 27, overallRating: 75, potential: 77, salary: 14, contractYears: 3, teamId: 'bos', isStarter: false, isStar: false },
  { name: 'Sam Hauser', position: 'SF', age: 27, overallRating: 71, potential: 73, salary: 5, contractYears: 2, teamId: 'bos', isStarter: false, isStar: false },

  // New York Knicks
  { name: 'Jalen Brunson', position: 'PG', age: 28, overallRating: 88, potential: 89, salary: 37, contractYears: 3, teamId: 'nyk', isStarter: true, isStar: true },
  { name: 'Karl-Anthony Towns', position: 'C', age: 29, overallRating: 85, potential: 86, salary: 36, contractYears: 3, teamId: 'nyk', isStarter: true, isStar: true },
  { name: 'Mikal Bridges', position: 'SF', age: 28, overallRating: 80, potential: 82, salary: 25, contractYears: 3, teamId: 'nyk', isStarter: true, isStar: false },
  { name: 'OG Anunoby', position: 'SF', age: 27, overallRating: 82, potential: 83, salary: 35, contractYears: 4, teamId: 'nyk', isStarter: true, isStar: false },
  { name: 'Josh Hart', position: 'SG', age: 29, overallRating: 76, potential: 77, salary: 18, contractYears: 3, teamId: 'nyk', isStarter: true, isStar: false },
  { name: 'Donte DiVincenzo', position: 'SG', age: 28, overallRating: 75, potential: 76, salary: 12, contractYears: 2, teamId: 'nyk', isStarter: false, isStar: false },
  { name: 'Mitchell Robinson', position: 'C', age: 26, overallRating: 74, potential: 78, salary: 14, contractYears: 2, teamId: 'nyk', isStarter: false, isStar: false },

  // Philadelphia 76ers
  { name: 'Joel Embiid', position: 'C', age: 30, overallRating: 92, potential: 92, salary: 52, contractYears: 3, teamId: 'phi', isStarter: true, isStar: true },
  { name: 'Paul George', position: 'SF', age: 34, overallRating: 82, potential: 82, salary: 42, contractYears: 3, teamId: 'phi', isStarter: true, isStar: true },
  { name: 'Tyrese Maxey', position: 'PG', age: 24, overallRating: 84, potential: 90, salary: 35, contractYears: 4, teamId: 'phi', isStarter: true, isStar: true },
  { name: 'Caleb Martin', position: 'SF', age: 29, overallRating: 73, potential: 74, salary: 8, contractYears: 3, teamId: 'phi', isStarter: true, isStar: false },
  { name: 'Andre Drummond', position: 'C', age: 31, overallRating: 72, potential: 72, salary: 5, contractYears: 1, teamId: 'phi', isStarter: false, isStar: false },
  { name: 'Kelly Oubre Jr.', position: 'SG', age: 28, overallRating: 74, potential: 75, salary: 8, contractYears: 2, teamId: 'phi', isStarter: true, isStar: false },

  // Brooklyn Nets
  { name: 'Cam Thomas', position: 'SG', age: 23, overallRating: 78, potential: 86, salary: 8, contractYears: 3, teamId: 'bkn', isStarter: true, isStar: false },
  { name: 'Mikal Bridges Jr.', position: 'SF', age: 24, overallRating: 72, potential: 80, salary: 5, contractYears: 3, teamId: 'bkn', isStarter: true, isStar: false },
  { name: 'Nic Claxton', position: 'C', age: 25, overallRating: 75, potential: 80, salary: 22, contractYears: 3, teamId: 'bkn', isStarter: true, isStar: false },
  { name: 'Ben Simmons', position: 'PG', age: 28, overallRating: 70, potential: 75, salary: 7, contractYears: 1, teamId: 'bkn', isStarter: true, isStar: false },
  { name: 'Dennis Schroder', position: 'PG', age: 31, overallRating: 73, potential: 73, salary: 6, contractYears: 1, teamId: 'bkn', isStarter: false, isStar: false },

  // Toronto Raptors
  { name: 'Scottie Barnes', position: 'SF', age: 23, overallRating: 82, potential: 91, salary: 27, contractYears: 4, teamId: 'tor', isStarter: true, isStar: true },
  { name: 'RJ Barrett', position: 'SG', age: 24, overallRating: 77, potential: 82, salary: 24, contractYears: 3, teamId: 'tor', isStarter: true, isStar: false },
  { name: 'Immanuel Quickley', position: 'PG', age: 25, overallRating: 75, potential: 80, salary: 19, contractYears: 3, teamId: 'tor', isStarter: true, isStar: false },
  { name: 'Jakob Poeltl', position: 'C', age: 29, overallRating: 74, potential: 75, salary: 20, contractYears: 2, teamId: 'tor', isStarter: true, isStar: false },
  { name: 'Gradey Dick', position: 'SG', age: 21, overallRating: 72, potential: 83, salary: 5, contractYears: 3, teamId: 'tor', isStarter: true, isStar: false },

  // Milwaukee Bucks
  { name: 'Giannis Antetokounmpo', position: 'PF', age: 30, overallRating: 95, potential: 95, salary: 48, contractYears: 3, teamId: 'mil', isStarter: true, isStar: true },
  { name: 'Damian Lillard', position: 'PG', age: 34, overallRating: 85, potential: 85, salary: 46, contractYears: 2, teamId: 'mil', isStarter: true, isStar: true },
  { name: 'Khris Middleton', position: 'SF', age: 33, overallRating: 78, potential: 78, salary: 32, contractYears: 1, teamId: 'mil', isStarter: true, isStar: false },
  { name: 'Brook Lopez', position: 'C', age: 36, overallRating: 76, potential: 76, salary: 23, contractYears: 1, teamId: 'mil', isStarter: true, isStar: false },
  { name: 'Bobby Portis', position: 'PF', age: 29, overallRating: 75, potential: 76, salary: 12, contractYears: 2, teamId: 'mil', isStarter: true, isStar: false },
  { name: 'Pat Connaughton', position: 'SG', age: 31, overallRating: 70, potential: 70, salary: 9, contractYears: 1, teamId: 'mil', isStarter: false, isStar: false },

  // Cleveland Cavaliers
  { name: 'Donovan Mitchell', position: 'SG', age: 28, overallRating: 88, potential: 89, salary: 35, contractYears: 3, teamId: 'cle', isStarter: true, isStar: true },
  { name: 'Darius Garland', position: 'PG', age: 25, overallRating: 83, potential: 87, salary: 34, contractYears: 4, teamId: 'cle', isStarter: true, isStar: true },
  { name: 'Evan Mobley', position: 'PF', age: 23, overallRating: 83, potential: 92, salary: 22, contractYears: 4, teamId: 'cle', isStarter: true, isStar: true },
  { name: 'Jarrett Allen', position: 'C', age: 26, overallRating: 80, potential: 82, salary: 20, contractYears: 3, teamId: 'cle', isStarter: true, isStar: false },
  { name: 'Max Strus', position: 'SG', age: 28, overallRating: 73, potential: 74, salary: 15, contractYears: 3, teamId: 'cle', isStarter: true, isStar: false },
  { name: 'Isaac Okoro', position: 'SF', age: 23, overallRating: 72, potential: 78, salary: 8, contractYears: 2, teamId: 'cle', isStarter: false, isStar: false },

  // Indiana Pacers
  { name: 'Tyrese Haliburton', position: 'PG', age: 24, overallRating: 86, potential: 92, salary: 35, contractYears: 4, teamId: 'ind', isStarter: true, isStar: true },
  { name: 'Pascal Siakam', position: 'PF', age: 30, overallRating: 83, potential: 83, salary: 37, contractYears: 3, teamId: 'ind', isStarter: true, isStar: true },
  { name: 'Myles Turner', position: 'C', age: 28, overallRating: 78, potential: 79, salary: 20, contractYears: 2, teamId: 'ind', isStarter: true, isStar: false },
  { name: 'Andrew Nembhard', position: 'PG', age: 24, overallRating: 74, potential: 80, salary: 5, contractYears: 3, teamId: 'ind', isStarter: true, isStar: false },
  { name: 'Aaron Nesmith', position: 'SF', age: 24, overallRating: 73, potential: 77, salary: 6, contractYears: 3, teamId: 'ind', isStarter: true, isStar: false },
  { name: 'Bennedict Mathurin', position: 'SG', age: 22, overallRating: 75, potential: 84, salary: 7, contractYears: 2, teamId: 'ind', isStarter: false, isStar: false },

  // Miami Heat
  { name: 'Jimmy Butler', position: 'SF', age: 35, overallRating: 84, potential: 84, salary: 49, contractYears: 1, teamId: 'mia', isStarter: true, isStar: true },
  { name: 'Bam Adebayo', position: 'C', age: 27, overallRating: 85, potential: 87, salary: 33, contractYears: 3, teamId: 'mia', isStarter: true, isStar: true },
  { name: 'Tyler Herro', position: 'SG', age: 25, overallRating: 80, potential: 83, salary: 26, contractYears: 3, teamId: 'mia', isStarter: true, isStar: false },
  { name: 'Terry Rozier', position: 'PG', age: 30, overallRating: 76, potential: 76, salary: 24, contractYears: 2, teamId: 'mia', isStarter: true, isStar: false },
  { name: 'Jaime Jaquez Jr.', position: 'SF', age: 24, overallRating: 74, potential: 80, salary: 4, contractYears: 3, teamId: 'mia', isStarter: true, isStar: false },
  { name: 'Kevin Love', position: 'PF', age: 36, overallRating: 70, potential: 70, salary: 4, contractYears: 1, teamId: 'mia', isStarter: false, isStar: false },

  // Orlando Magic
  { name: 'Paolo Banchero', position: 'PF', age: 22, overallRating: 84, potential: 93, salary: 12, contractYears: 3, teamId: 'orl', isStarter: true, isStar: true },
  { name: 'Franz Wagner', position: 'SF', age: 23, overallRating: 82, potential: 89, salary: 25, contractYears: 4, teamId: 'orl', isStarter: true, isStar: true },
  { name: 'Jalen Suggs', position: 'PG', age: 23, overallRating: 76, potential: 83, salary: 8, contractYears: 2, teamId: 'orl', isStarter: true, isStar: false },
  { name: 'Wendell Carter Jr.', position: 'C', age: 25, overallRating: 76, potential: 79, salary: 13, contractYears: 3, teamId: 'orl', isStarter: true, isStar: false },
  { name: 'Anthony Black', position: 'SG', age: 21, overallRating: 70, potential: 82, salary: 5, contractYears: 3, teamId: 'orl', isStarter: true, isStar: false },

  // Chicago Bulls
  { name: 'Zach LaVine', position: 'SG', age: 29, overallRating: 82, potential: 83, salary: 43, contractYears: 2, teamId: 'chi', isStarter: true, isStar: true },
  { name: 'DeMar DeRozan', position: 'SF', age: 35, overallRating: 82, potential: 82, salary: 28, contractYears: 1, teamId: 'chi', isStarter: true, isStar: true },
  { name: 'Nikola Vucevic', position: 'C', age: 34, overallRating: 78, potential: 78, salary: 20, contractYears: 1, teamId: 'chi', isStarter: true, isStar: false },
  { name: 'Coby White', position: 'PG', age: 24, overallRating: 76, potential: 80, salary: 12, contractYears: 3, teamId: 'chi', isStarter: true, isStar: false },
  { name: 'Patrick Williams', position: 'PF', age: 23, overallRating: 72, potential: 80, salary: 10, contractYears: 3, teamId: 'chi', isStarter: true, isStar: false },
  { name: 'Ayo Dosunmu', position: 'PG', age: 24, overallRating: 73, potential: 77, salary: 8, contractYears: 3, teamId: 'chi', isStarter: false, isStar: false },

  // Detroit Pistons
  { name: 'Cade Cunningham', position: 'PG', age: 23, overallRating: 80, potential: 90, salary: 10, contractYears: 3, teamId: 'det', isStarter: true, isStar: true },
  { name: 'Jaden Ivey', position: 'SG', age: 22, overallRating: 74, potential: 85, salary: 8, contractYears: 3, teamId: 'det', isStarter: true, isStar: false },
  { name: 'Ausar Thompson', position: 'SF', age: 21, overallRating: 72, potential: 85, salary: 6, contractYears: 3, teamId: 'det', isStarter: true, isStar: false },
  { name: 'Jalen Duren', position: 'C', age: 21, overallRating: 75, potential: 85, salary: 5, contractYears: 3, teamId: 'det', isStarter: true, isStar: false },
  { name: 'Marcus Sasser', position: 'PG', age: 24, overallRating: 68, potential: 76, salary: 3, contractYears: 3, teamId: 'det', isStarter: true, isStar: false },

  // Atlanta Hawks
  { name: 'Trae Young', position: 'PG', age: 26, overallRating: 86, potential: 89, salary: 40, contractYears: 3, teamId: 'atl', isStarter: true, isStar: true },
  { name: 'Dejounte Murray', position: 'SG', age: 28, overallRating: 80, potential: 82, salary: 28, contractYears: 3, teamId: 'atl', isStarter: true, isStar: false },
  { name: 'Jalen Johnson', position: 'SF', age: 22, overallRating: 75, potential: 84, salary: 5, contractYears: 3, teamId: 'atl', isStarter: true, isStar: false },
  { name: 'Clint Capela', position: 'C', age: 30, overallRating: 75, potential: 75, salary: 22, contractYears: 1, teamId: 'atl', isStarter: true, isStar: false },
  { name: 'De\'Andre Hunter', position: 'SF', age: 27, overallRating: 74, potential: 77, salary: 20, contractYears: 2, teamId: 'atl', isStarter: true, isStar: false },
  { name: 'Bogdan Bogdanovic', position: 'SG', age: 32, overallRating: 73, potential: 73, salary: 17, contractYears: 1, teamId: 'atl', isStarter: false, isStar: false },

  // Charlotte Hornets
  { name: 'LaMelo Ball', position: 'PG', age: 23, overallRating: 82, potential: 91, salary: 33, contractYears: 4, teamId: 'cha', isStarter: true, isStar: true },
  { name: 'Brandon Miller', position: 'SF', age: 22, overallRating: 76, potential: 88, salary: 10, contractYears: 3, teamId: 'cha', isStarter: true, isStar: false },
  { name: 'Mark Williams', position: 'C', age: 22, overallRating: 73, potential: 82, salary: 5, contractYears: 3, teamId: 'cha', isStarter: true, isStar: false },
  { name: 'Miles Bridges', position: 'PF', age: 26, overallRating: 75, potential: 78, salary: 22, contractYears: 2, teamId: 'cha', isStarter: true, isStar: false },
  { name: 'Nick Richards', position: 'C', age: 27, overallRating: 70, potential: 73, salary: 5, contractYears: 2, teamId: 'cha', isStarter: true, isStar: false },

  // Washington Wizards
  { name: 'Kyle Kuzma', position: 'PF', age: 29, overallRating: 77, potential: 78, salary: 23, contractYears: 2, teamId: 'was', isStarter: true, isStar: false },
  { name: 'Jordan Poole', position: 'SG', age: 25, overallRating: 74, potential: 80, salary: 28, contractYears: 3, teamId: 'was', isStarter: true, isStar: false },
  { name: 'Bilal Coulibaly', position: 'SF', age: 20, overallRating: 70, potential: 85, salary: 6, contractYears: 3, teamId: 'was', isStarter: true, isStar: false },
  { name: 'Deni Avdija', position: 'SF', age: 23, overallRating: 73, potential: 80, salary: 8, contractYears: 3, teamId: 'was', isStarter: true, isStar: false },
  { name: 'Daniel Gafford', position: 'C', age: 25, overallRating: 72, potential: 76, salary: 13, contractYears: 2, teamId: 'was', isStarter: true, isStar: false },

  // Oklahoma City Thunder
  { name: 'Shai Gilgeous-Alexander', position: 'PG', age: 26, overallRating: 94, potential: 96, salary: 40, contractYears: 4, teamId: 'okc', isStarter: true, isStar: true },
  { name: 'Chet Holmgren', position: 'C', age: 22, overallRating: 83, potential: 93, salary: 12, contractYears: 3, teamId: 'okc', isStarter: true, isStar: true },
  { name: 'Jalen Williams', position: 'SF', age: 24, overallRating: 82, potential: 88, salary: 8, contractYears: 3, teamId: 'okc', isStarter: true, isStar: false },
  { name: 'Lu Dort', position: 'SG', age: 25, overallRating: 75, potential: 78, salary: 15, contractYears: 3, teamId: 'okc', isStarter: true, isStar: false },
  { name: 'Josh Giddey', position: 'PG', age: 22, overallRating: 74, potential: 83, salary: 8, contractYears: 2, teamId: 'okc', isStarter: true, isStar: false },
  { name: 'Isaiah Joe', position: 'SG', age: 25, overallRating: 70, potential: 74, salary: 4, contractYears: 2, teamId: 'okc', isStarter: false, isStar: false },

  // Denver Nuggets
  { name: 'Nikola Jokic', position: 'C', age: 29, overallRating: 97, potential: 97, salary: 51, contractYears: 4, teamId: 'den', isStarter: true, isStar: true },
  { name: 'Jamal Murray', position: 'PG', age: 27, overallRating: 84, potential: 86, salary: 34, contractYears: 3, teamId: 'den', isStarter: true, isStar: true },
  { name: 'Michael Porter Jr.', position: 'SF', age: 26, overallRating: 80, potential: 85, salary: 35, contractYears: 3, teamId: 'den', isStarter: true, isStar: false },
  { name: 'Aaron Gordon', position: 'PF', age: 29, overallRating: 78, potential: 79, salary: 23, contractYears: 2, teamId: 'den', isStarter: true, isStar: false },
  { name: 'Kentavious Caldwell-Pope', position: 'SG', age: 31, overallRating: 75, potential: 75, salary: 15, contractYears: 2, teamId: 'den', isStarter: true, isStar: false },
  { name: 'Reggie Jackson', position: 'PG', age: 34, overallRating: 70, potential: 70, salary: 5, contractYears: 1, teamId: 'den', isStarter: false, isStar: false },

  // Minnesota Timberwolves
  { name: 'Anthony Edwards', position: 'SG', age: 23, overallRating: 90, potential: 96, salary: 36, contractYears: 4, teamId: 'min', isStarter: true, isStar: true },
  { name: 'Karl-Anthony Towns Jr.', position: 'C', age: 29, overallRating: 84, potential: 85, salary: 36, contractYears: 3, teamId: 'min', isStarter: true, isStar: true },
  { name: 'Rudy Gobert', position: 'C', age: 32, overallRating: 80, potential: 80, salary: 41, contractYears: 2, teamId: 'min', isStarter: true, isStar: false },
  { name: 'Jaden McDaniels', position: 'SF', age: 24, overallRating: 76, potential: 83, salary: 14, contractYears: 3, teamId: 'min', isStarter: true, isStar: false },
  { name: 'Mike Conley', position: 'PG', age: 37, overallRating: 73, potential: 73, salary: 11, contractYears: 1, teamId: 'min', isStarter: true, isStar: false },
  { name: 'Naz Reid', position: 'PF', age: 25, overallRating: 75, potential: 79, salary: 13, contractYears: 3, teamId: 'min', isStarter: false, isStar: false },

  // Dallas Mavericks
  { name: 'Luka Doncic', position: 'PG', age: 25, overallRating: 95, potential: 98, salary: 43, contractYears: 4, teamId: 'dal', isStarter: true, isStar: true },
  { name: 'Kyrie Irving', position: 'PG', age: 32, overallRating: 85, potential: 85, salary: 41, contractYears: 2, teamId: 'dal', isStarter: true, isStar: true },
  { name: 'Daniel Gafford II', position: 'C', age: 25, overallRating: 74, potential: 78, salary: 13, contractYears: 3, teamId: 'dal', isStarter: true, isStar: false },
  { name: 'Dereck Lively II', position: 'C', age: 20, overallRating: 73, potential: 85, salary: 5, contractYears: 3, teamId: 'dal', isStarter: true, isStar: false },
  { name: 'P.J. Washington', position: 'PF', age: 26, overallRating: 77, potential: 79, salary: 17, contractYears: 3, teamId: 'dal', isStarter: true, isStar: false },
  { name: 'Tim Hardaway Jr.', position: 'SG', age: 32, overallRating: 72, potential: 72, salary: 16, contractYears: 1, teamId: 'dal', isStarter: false, isStar: false },

  // Memphis Grizzlies
  { name: 'Ja Morant', position: 'PG', age: 25, overallRating: 88, potential: 93, salary: 34, contractYears: 4, teamId: 'mem', isStarter: true, isStar: true },
  { name: 'Desmond Bane', position: 'SG', age: 26, overallRating: 80, potential: 84, salary: 28, contractYears: 3, teamId: 'mem', isStarter: true, isStar: false },
  { name: 'Jaren Jackson Jr.', position: 'PF', age: 25, overallRating: 82, potential: 87, salary: 30, contractYears: 3, teamId: 'mem', isStarter: true, isStar: true },
  { name: 'Marcus Smart', position: 'PG', age: 30, overallRating: 75, potential: 76, salary: 20, contractYears: 2, teamId: 'mem', isStarter: true, isStar: false },
  { name: 'Santi Aldama', position: 'C', age: 23, overallRating: 72, potential: 78, salary: 5, contractYears: 2, teamId: 'mem', isStarter: true, isStar: false },

  // Houston Rockets
  { name: 'Jalen Green', position: 'SG', age: 22, overallRating: 79, potential: 89, salary: 10, contractYears: 3, teamId: 'hou', isStarter: true, isStar: false },
  { name: 'Alperen Sengun', position: 'C', age: 22, overallRating: 80, potential: 88, salary: 8, contractYears: 3, teamId: 'hou', isStarter: true, isStar: true },
  { name: 'Jabari Smith Jr.', position: 'PF', age: 21, overallRating: 75, potential: 87, salary: 10, contractYears: 3, teamId: 'hou', isStarter: true, isStar: false },
  { name: 'Fred VanVleet', position: 'PG', age: 30, overallRating: 78, potential: 79, salary: 43, contractYears: 2, teamId: 'hou', isStarter: true, isStar: false },
  { name: 'Dillon Brooks', position: 'SF', age: 28, overallRating: 73, potential: 75, salary: 12, contractYears: 3, teamId: 'hou', isStarter: true, isStar: false },
  { name: 'Amen Thompson', position: 'SG', age: 21, overallRating: 71, potential: 84, salary: 6, contractYears: 3, teamId: 'hou', isStarter: false, isStar: false },

  // San Antonio Spurs
  { name: 'Victor Wembanyama', position: 'C', age: 21, overallRating: 85, potential: 99, salary: 12, contractYears: 3, teamId: 'sas', isStarter: true, isStar: true },
  { name: 'Devin Vassell', position: 'SG', age: 24, overallRating: 77, potential: 83, salary: 20, contractYears: 3, teamId: 'sas', isStarter: true, isStar: false },
  { name: 'Jeremy Sochan', position: 'PF', age: 21, overallRating: 73, potential: 83, salary: 7, contractYears: 3, teamId: 'sas', isStarter: true, isStar: false },
  { name: 'Keldon Johnson', position: 'SF', age: 24, overallRating: 73, potential: 78, salary: 20, contractYears: 3, teamId: 'sas', isStarter: true, isStar: false },
  { name: 'Tre Jones', position: 'PG', age: 24, overallRating: 71, potential: 76, salary: 9, contractYears: 3, teamId: 'sas', isStarter: true, isStar: false },

  // New Orleans Pelicans
  { name: 'Zion Williamson', position: 'PF', age: 24, overallRating: 85, potential: 95, salary: 36, contractYears: 3, teamId: 'nop', isStarter: true, isStar: true },
  { name: 'Brandon Ingram', position: 'SF', age: 27, overallRating: 82, potential: 84, salary: 36, contractYears: 1, teamId: 'nop', isStarter: true, isStar: true },
  { name: 'CJ McCollum', position: 'SG', age: 33, overallRating: 76, potential: 76, salary: 34, contractYears: 1, teamId: 'nop', isStarter: true, isStar: false },
  { name: 'Herbert Jones', position: 'SF', age: 26, overallRating: 74, potential: 79, salary: 9, contractYears: 3, teamId: 'nop', isStarter: true, isStar: false },
  { name: 'Jonas Valanciunas', position: 'C', age: 32, overallRating: 75, potential: 75, salary: 15, contractYears: 1, teamId: 'nop', isStarter: true, isStar: false },

  // Portland Trail Blazers
  { name: 'Anfernee Simons', position: 'SG', age: 25, overallRating: 79, potential: 84, salary: 25, contractYears: 3, teamId: 'por', isStarter: true, isStar: false },
  { name: 'Scoot Henderson', position: 'PG', age: 20, overallRating: 72, potential: 89, salary: 10, contractYears: 3, teamId: 'por', isStarter: true, isStar: false },
  { name: 'Jerami Grant', position: 'PF', age: 30, overallRating: 76, potential: 77, salary: 31, contractYears: 3, teamId: 'por', isStarter: true, isStar: false },
  { name: 'Deandre Ayton', position: 'C', age: 26, overallRating: 77, potential: 82, salary: 34, contractYears: 2, teamId: 'por', isStarter: true, isStar: false },
  { name: 'Shaedon Sharpe', position: 'SG', age: 21, overallRating: 73, potential: 87, salary: 7, contractYears: 3, teamId: 'por', isStarter: true, isStar: false },

  // Utah Jazz
  { name: 'Lauri Markkanen', position: 'PF', age: 27, overallRating: 83, potential: 85, salary: 18, contractYears: 4, teamId: 'uta', isStarter: true, isStar: true },
  { name: 'Collin Sexton', position: 'PG', age: 25, overallRating: 75, potential: 80, salary: 18, contractYears: 3, teamId: 'uta', isStarter: true, isStar: false },
  { name: 'Jordan Clarkson', position: 'SG', age: 32, overallRating: 75, potential: 75, salary: 14, contractYears: 2, teamId: 'uta', isStarter: true, isStar: false },
  { name: 'Walker Kessler', position: 'C', age: 23, overallRating: 73, potential: 82, salary: 4, contractYears: 2, teamId: 'uta', isStarter: true, isStar: false },
  { name: 'Taylor Hendricks', position: 'SF', age: 21, overallRating: 68, potential: 82, salary: 5, contractYears: 3, teamId: 'uta', isStarter: true, isStar: false },

  // Golden State Warriors
  { name: 'Stephen Curry', position: 'PG', age: 36, overallRating: 90, potential: 90, salary: 52, contractYears: 2, teamId: 'gsw', isStarter: true, isStar: true },
  { name: 'Klay Thompson', position: 'SG', age: 34, overallRating: 76, potential: 76, salary: 20, contractYears: 1, teamId: 'gsw', isStarter: true, isStar: false },
  { name: 'Andrew Wiggins', position: 'SF', age: 29, overallRating: 77, potential: 80, salary: 25, contractYears: 2, teamId: 'gsw', isStarter: true, isStar: false },
  { name: 'Draymond Green', position: 'PF', age: 34, overallRating: 76, potential: 76, salary: 24, contractYears: 2, teamId: 'gsw', isStarter: true, isStar: false },
  { name: 'Kevon Looney', position: 'C', age: 28, overallRating: 72, potential: 73, salary: 8, contractYears: 2, teamId: 'gsw', isStarter: true, isStar: false },
  { name: 'Jonathan Kuminga', position: 'PF', age: 22, overallRating: 75, potential: 86, salary: 6, contractYears: 2, teamId: 'gsw', isStarter: false, isStar: false },

  // Los Angeles Lakers
  { name: 'LeBron James', position: 'SF', age: 40, overallRating: 87, potential: 87, salary: 47, contractYears: 1, teamId: 'lal', isStarter: true, isStar: true },
  { name: 'Anthony Davis', position: 'PF', age: 31, overallRating: 88, potential: 88, salary: 40, contractYears: 2, teamId: 'lal', isStarter: true, isStar: true },
  { name: 'Austin Reaves', position: 'SG', age: 26, overallRating: 78, potential: 82, salary: 14, contractYears: 3, teamId: 'lal', isStarter: true, isStar: false },
  { name: "D'Angelo Russell", position: 'PG', age: 28, overallRating: 76, potential: 77, salary: 18, contractYears: 1, teamId: 'lal', isStarter: true, isStar: false },
  { name: 'Rui Hachimura', position: 'PF', age: 26, overallRating: 74, potential: 78, salary: 17, contractYears: 3, teamId: 'lal', isStarter: true, isStar: false },
  { name: 'Jarred Vanderbilt', position: 'PF', age: 25, overallRating: 72, potential: 76, salary: 11, contractYears: 2, teamId: 'lal', isStarter: false, isStar: false },

  // Los Angeles Clippers
  { name: 'Kawhi Leonard', position: 'SF', age: 33, overallRating: 86, potential: 86, salary: 45, contractYears: 2, teamId: 'lac', isStarter: true, isStar: true },
  { name: 'James Harden', position: 'PG', age: 35, overallRating: 80, potential: 80, salary: 35, contractYears: 1, teamId: 'lac', isStarter: true, isStar: true },
  { name: 'Ivica Zubac', position: 'C', age: 27, overallRating: 75, potential: 77, salary: 11, contractYears: 2, teamId: 'lac', isStarter: true, isStar: false },
  { name: 'Terance Mann', position: 'SG', age: 28, overallRating: 72, potential: 74, salary: 12, contractYears: 2, teamId: 'lac', isStarter: true, isStar: false },
  { name: 'Norman Powell', position: 'SG', age: 31, overallRating: 75, potential: 75, salary: 16, contractYears: 2, teamId: 'lac', isStarter: true, isStar: false },

  // Phoenix Suns
  { name: 'Kevin Durant', position: 'SF', age: 36, overallRating: 89, potential: 89, salary: 47, contractYears: 2, teamId: 'phx', isStarter: true, isStar: true },
  { name: 'Devin Booker', position: 'SG', age: 27, overallRating: 88, potential: 90, salary: 36, contractYears: 3, teamId: 'phx', isStarter: true, isStar: true },
  { name: 'Bradley Beal', position: 'SG', age: 31, overallRating: 78, potential: 78, salary: 47, contractYears: 2, teamId: 'phx', isStarter: true, isStar: false },
  { name: 'Jusuf Nurkic', position: 'C', age: 30, overallRating: 74, potential: 75, salary: 18, contractYears: 2, teamId: 'phx', isStarter: true, isStar: false },
  { name: 'Grayson Allen', position: 'SG', age: 29, overallRating: 73, potential: 74, salary: 11, contractYears: 2, teamId: 'phx', isStarter: true, isStar: false },

  // Sacramento Kings
  { name: 'De\'Aaron Fox', position: 'PG', age: 27, overallRating: 86, potential: 88, salary: 34, contractYears: 3, teamId: 'sac', isStarter: true, isStar: true },
  { name: 'Domantas Sabonis', position: 'C', age: 28, overallRating: 84, potential: 85, salary: 31, contractYears: 3, teamId: 'sac', isStarter: true, isStar: true },
  { name: 'Keegan Murray', position: 'SF', age: 24, overallRating: 76, potential: 83, salary: 6, contractYears: 3, teamId: 'sac', isStarter: true, isStar: false },
  { name: 'Harrison Barnes', position: 'PF', age: 32, overallRating: 73, potential: 73, salary: 18, contractYears: 1, teamId: 'sac', isStarter: true, isStar: false },
  { name: 'Kevin Huerter', position: 'SG', age: 26, overallRating: 73, potential: 76, salary: 15, contractYears: 2, teamId: 'sac', isStarter: true, isStar: false },
];

export function generateAllPlayers(): Player[] {
  playerIdCounter = 1;
  return PLAYER_SEEDS.map(createPlayer);
}

// Generate filler players for teams that need more roster spots
function generateFillerName(): string {
  const firsts = ['James', 'Marcus', 'Tyler', 'Chris', 'Derek', 'Andre', 'Kevin', 'Mike', 'Tony', 'David', 'Ryan', 'Alex', 'Jordan', 'Isaiah', 'Malik', 'Cam', 'DeAndre', 'Jalen', 'Tre', 'Zach'];
  const lasts = ['Williams', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Robinson', 'Clark', 'Lewis', 'Walker', 'Allen', 'King'];
  return `${firsts[Math.floor(Math.random() * firsts.length)]} ${lasts[Math.floor(Math.random() * lasts.length)]}`;
}

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export function generateFillerPlayer(teamId: string): Player {
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const age = 20 + Math.floor(Math.random() * 12);
  const overall = 60 + Math.floor(Math.random() * 15);
  return createPlayer({
    name: generateFillerName(),
    position,
    age,
    overallRating: overall,
    potential: overall + Math.floor(Math.random() * 10),
    salary: 2 + Math.floor(Math.random() * 5),
    contractYears: 1 + Math.floor(Math.random() * 3),
    teamId,
    isStarter: false,
    isStar: false,
  });
}

export function fillRostersToMinimum(teams: import('./types').Team[], players: Player[]): Player[] {
  const allPlayers = [...players];
  const MIN_ROSTER = 12;

  for (const team of teams) {
    const teamPlayers = allPlayers.filter(p => p.teamId === team.id);
    const needed = MIN_ROSTER - teamPlayers.length;
    for (let i = 0; i < needed; i++) {
      allPlayers.push(generateFillerPlayer(team.id));
    }
  }

  return allPlayers;
}
