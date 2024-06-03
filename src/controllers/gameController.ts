import { PrismaClient } from '@prisma/client';
import path from 'path';
import { Request, Response } from 'express';
import { createGame, getGameData, getGamesLinks } from '../models/gameModel';
import { format } from 'date-fns';

const prisma = new PrismaClient();

function sleep(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function processGames<T>(
  links: T[],
  batchSize: number,
  callback: (link: T) => Promise<any>
): Promise<any[]> {
  let result: any[] = [];

  for (let i = 0; i < links.length; i += batchSize) {
    console.log(`${((i / links.length) * 100).toFixed(2)}% (${i}/${links.length})`);
    const batch = links.slice(i, i + batchSize);
    result = result.concat(
      await Promise.all(
        batch.map(async (link) => {
          return await callback(link);
        })
      )
    );
    await sleep(10000); // Aguarda 10 segundos entre os lotes
  }

  console.log(`100% (${links.length}/${links.length})`);

  return result;
}

async function getTeamGames(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params;
    const teamPage = `https://fbref.com/en/squads/${id}`;
    const gamesData = await getGamesData(teamPage);
    response.status(200).json(gamesData);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function getTeamGamesBySeason(request: Request, response: Response): Promise<void> {
  try {
    const { id, seasons } = request.query;
    const seasonsArr = (seasons as string).split(',');

    const gamesData: any[] = [];

    for (const season of seasonsArr) {
      const teamPage = `https://fbref.com/en/squads/${id}/${season}`;
      gamesData.push(await getGamesData(teamPage));
    }

    const result = await Promise.all(gamesData);
    response.status(200).json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function processGamesSequentially(games: any[]): Promise<any[]> {
  const processedGames: any[] = [];
  for (const game of games) {
    const createdGame = await createGame(game);
    processedGames.push(createdGame);
  }
  return processedGames;
}

async function getGamesData(teamPage: string): Promise<any> {
  try {
    const teamSelector = teamPage.split('/')[5];
    const __dirname = path.resolve();
    const links = await getGamesLinks(teamPage);

    const today = parseInt(format(new Date(), 'yyyyMMdd'));
    const filteredGames = links.filter(link => parseInt(link.date) < today);

    const playersStatsPromises = await processGames(
      filteredGames,
      5,
      async (game) => await getGameData(game, __dirname, teamSelector)
    );

    const games = await Promise.all(playersStatsPromises);
    const createdGames = await processGamesSequentially(games);

    return createdGames || null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getHomeManagers(request: Request, response: Response): Promise<void> {
  try {
    const data = await prisma.games.findMany({
      select: {
        id: true,
        homeManager: true,
      },
      distinct: ['homeManager'],
      orderBy: {
        homeManager: 'asc',
      },
    });
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getAwayManagers(request: Request, response: Response): Promise<void> {
  try {
    const data = await prisma.games.findMany({
      select: {
        id: true,
        awayManager: true,
      },
      distinct: ['awayManager'],
      orderBy: {
        awayManager: 'asc',
      },
    });
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getHomeTeams(request: Request, response: Response): Promise<void> {
  try {
    const data = await prisma.games.findMany({
      select: {
        id: true,
        homeTeam: true,
      },
      distinct: ['homeTeam'],
      orderBy: {
        homeTeam: 'asc',
      },
    });
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getAwayTeams(request: Request, response: Response): Promise<void> {
  try {
    const data = await prisma.games.findMany({
      select: {
        id: true,
        awayTeam: true,
      },
      distinct: ['awayTeam'],
      orderBy: {
        awayTeam: 'asc',
      },
    });
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getGamesStats(request: Request, response: Response): Promise<void> {
  try {
    const { game } = request.query;
    const parsedGame = game === undefined ? {} : JSON.parse(game as string);

    const games = await prisma.games.findMany({
      where: {
        ...parsedGame,
      },
    });

    const gamesAmount = games.length;
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let bothScored = 0;
    const homeTeamGoals: number[] = [];
    const awayTeamGoals: number[] = [];
    const gameTotalOver: { [key: string]: number } = {
      atLeast1: 0,
      atLeast2: 0,
      atLeast3: 0,
      atLeast4: 0,
      atLeast5: 0,
    };
    const homeTeamOver: { [key: string]: number } = {
      atLeast1: 0,
      atLeast2: 0,
      atLeast3: 0,
      atLeast4: 0,
      atLeast5: 0,
    };
    const awayTeamOver: { [key: string]: number } = {
      atLeast1: 0,
      atLeast2: 0,
      atLeast3: 0,
      atLeast4: 0,
      atLeast5: 0,
    };

    games.forEach((game) => {
      if (game.winner !== 'Draw') {
        if (game.winner === game.homeTeam) homeWins++;
        if (game.winner === game.awayTeam) awayWins++;
      } else {
        draws++;
      }
      homeTeamGoals.push(game.homeTeamGoals);
      awayTeamGoals.push(game.awayTeamGoals);
      if (game.homeTeamGoals > 0 || game.awayTeamGoals > 0) {
        const totalGoals = game.homeTeamGoals + game.awayTeamGoals;

        for (let i = 0; i < Math.min(totalGoals, Object.keys(gameTotalOver).length); i++) {
          gameTotalOver[`atLeast${i + 1}`]++;
        }

        if (game.homeTeamGoals > 0 && game.awayTeamGoals > 0) bothScored++;
      }

      for (let i = 0; i < Math.min(game.homeTeamGoals, Object.keys(homeTeamOver).length); i++) {
        homeTeamOver[`atLeast${i + 1}`]++;
      }
      for (let i = 0; i < Math.min(game.awayTeamGoals, Object.keys(awayTeamOver).length); i++) {
        awayTeamOver[`atLeast${i + 1}`]++;
      }
    });

    const data = {
      games: gamesAmount,
      homeTeamWins: homeWins,
      draws: draws,
      awayTeamWins: awayWins,
      homeTeamWinPercentage: ((homeWins / gamesAmount) * 100).toFixed(2),
      homeAndDrawsPercentage: (((homeWins + draws) / gamesAmount) * 100).toFixed(2),
      drawsPercentage: ((draws / gamesAmount) * 100).toFixed(2),
      awayAndDrawsPercentage: (((awayWins + draws) / gamesAmount) * 100).toFixed(2),
      awayTeamWinPercentage: ((awayWins / gamesAmount) * 100).toFixed(2),
      homeAwayWinPercentage: (((homeWins + awayWins) / gamesAmount) * 100).toFixed(2),
      homeTeamGoalsAverage: (homeTeamGoals.reduce((a, b) => a + b, 0) / gamesAmount).toFixed(2),
      awayTeamGoalsAverage: (awayTeamGoals.reduce((a, b) => a + b, 0) / gamesAmount).toFixed(2),
      bothScored,
      bothScoredPercentual: ((bothScored / gamesAmount) * 100).toFixed(2),
      notBothScoredPercentual: ((1 - (bothScored / gamesAmount)) * 100).toFixed(2),
      homeTeamMinGoals: Math.min(...homeTeamGoals),
      awayTeamMinGoals: Math.min(...awayTeamGoals),
      homeTeamMaxGoals: Math.max(...homeTeamGoals),
      awayTeamMaxGoals: Math.max(...awayTeamGoals),
      homeTeamGoalsOver: homeTeamOver,
      homeTeamGoalsOverPercentage: {
        atLeast1: ((homeTeamOver.atLeast1 / gamesAmount) * 100).toFixed(2),
        atLeast2: ((homeTeamOver.atLeast2 / gamesAmount) * 100).toFixed(2),
        atLeast3: ((homeTeamOver.atLeast3 / gamesAmount) * 100).toFixed(2),
        atLeast4: ((homeTeamOver.atLeast4 / gamesAmount) * 100).toFixed(2),
        atLeast5: ((homeTeamOver.atLeast5 / gamesAmount) * 100).toFixed(2),
      },
      awayTeamGoalsOver: awayTeamOver,
      awayTeamGoalsOverPercentage: {
        atLeast1: ((awayTeamOver.atLeast1 / gamesAmount) * 100).toFixed(2),
        atLeast2: ((awayTeamOver.atLeast2 / gamesAmount) * 100).toFixed(2),
        atLeast3: ((awayTeamOver.atLeast3 / gamesAmount) * 100).toFixed(2),
        atLeast4: ((awayTeamOver.atLeast4 / gamesAmount) * 100).toFixed(2),
        atLeast5: ((awayTeamOver.atLeast5 / gamesAmount) * 100).toFixed(2),
      },
      gameTotalOver,
      gameTotalOverPercentage: {
        atLeast1: ((gameTotalOver.atLeast1 / gamesAmount) * 100).toFixed(2),
        atLeast2: ((gameTotalOver.atLeast2 / gamesAmount) * 100).toFixed(2),
        atLeast3: ((gameTotalOver.atLeast3 / gamesAmount) * 100).toFixed(2),
        atLeast4: ((gameTotalOver.atLeast4 / gamesAmount) * 100).toFixed(2),
        atLeast5: ((gameTotalOver.atLeast5 / gamesAmount) * 100).toFixed(2),
      },
    };

    response.status(200).json(data);
  } catch (error) {
    response.status(500).json(error);
  }
}

export {
  getGamesData,
  getHomeManagers,
  getAwayManagers,
  getHomeTeams,
  getAwayTeams,
  getGamesStats,
  getTeamGames,
  getTeamGamesBySeason,
};
