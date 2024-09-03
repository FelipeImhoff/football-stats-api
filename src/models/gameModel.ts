import { PrismaClient, Games, PlayersStats } from '@prisma/client';
import { formatDate, getTeamId, getGameData, getGamesLinks } from './../services/scraper.js';
import { GameWithoutId, ScrappedGameData } from '../types/games.js';

const prisma = new PrismaClient();

async function createGame({
  date, homeTeam, awayTeam, homeTeamGoals, awayTeamGoals,
  gameStats, homeManager, awayManager, gameLink, season, competition
}: ScrappedGameData): Promise<{createdGame: Games | string, createdGameStats: PlayersStats[] | string}> {
  const homeGoalsInt: number = parseInt(homeTeamGoals);
  const awayGoalsInt: number = parseInt(awayTeamGoals);
  const homeTeamId: string = await getTeamId(homeTeam, true, gameLink);
  const awayTeamId: string = await getTeamId(awayTeam, false, gameLink);

  const game: GameWithoutId = {
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

  const gameFound: Games | null = await prisma.games.findFirst({
    where: {
      ...game
    }
  });

  if (!gameFound) {
    const createdGame: Games = await prisma.games.create({
      data: {
        ...game
      }
    });

    const createdGameStats: PlayersStats[] = await Promise.all(gameStats.map(player => {
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

