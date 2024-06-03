import { PrismaClient } from '@prisma/client';
import { formatDate, getTeamId, createTeam, getManagers, getGameData, getGamesLinks } from './../services/scraper';

const prisma = new PrismaClient();

interface PlayerStats {
  name: string;
  minutesPlayed: string;
  goals: string;
  assists: string;
  convertedPenalties: string;
  attemptedPenalties: string;
  shots: string;
  shotsOnTarget: string;
  xG: string;
  npxG: string;
  xAG: string;
}

interface GameStats {
  date: string;
  gameLink: string;
  season: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamGoals: string;
  awayTeamGoals: string;
  gameStats: PlayerStats[];
  homeManager: string;
  awayManager: string;
}

async function createGame({
  date, homeTeam, awayTeam, homeTeamGoals, awayTeamGoals,
  gameStats, homeManager, awayManager, gameLink, season, competition
}: GameStats) {
  let createdGame, createdGameStats;
  const homeGoalsInt = parseInt(homeTeamGoals);
  const awayGoalsInt = parseInt(awayTeamGoals);
  const homeTeamId = await getTeamId(homeTeam, true, gameLink);
  const awayTeamId = await getTeamId(awayTeam, false, gameLink);

  const game = {
    date: await formatDate(date),
    winner: homeGoalsInt > awayGoalsInt ? homeTeam : (homeGoalsInt < awayGoalsInt ? awayTeam : 'Draw'),
    homeTeamId,
    awayTeamId,
    homeTeamGoals: homeGoalsInt,
    awayTeamGoals: awayGoalsInt,
    homeManager,
    awayManager,
    link: gameLink,
    season,
    competition
  };

  const gameFound = await prisma.games.findFirst({
    where: {
      ...game
    }
  });

  if (!gameFound) {
    createdGame = await prisma.games.create({
      data: {
        ...game
      }
    });

    createdGameStats = await Promise.all(gameStats.map(player => {
      return prisma.playersStats.create({
        data: {
          name: player.name,
          game_id: createdGame.id,
          minutesPlayed: parseInt(player.minutesPlayed),
          goals: parseInt(player.goals),
          assists: parseInt(player.assists),
          convertedPenalties: parseInt(player.convertedPenalties),
          attemptedPenalties: parseInt(player.attemptedPenalties),
          shots: parseInt(player.shots),
          shotsOnTarget: parseInt(player.shotsOnTarget),
          xG: parseFloat(player.xG) || 0.0,
          npxG: parseFloat(player.npxG) || 0.0,
          xAG: parseFloat(player.xAG) || 0.0,
        },
      });
    }));

    return { createdGame, createdGameStats };
  }

  return { createdGame: 'Game already exists', createdGameStats: 'GameStats already exists' };
}

export { createGame, getGameData, getGamesLinks };

