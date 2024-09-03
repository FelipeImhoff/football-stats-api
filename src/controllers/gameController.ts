import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { getGameData, getGamesLinks } from '../models/gameModel.js';
import { format } from 'date-fns';
import { fetchGamesData, processGames } from '../services/gameService.js';
import { processGamesSequentially } from '../services/utils.js';
import { ScrappedGameData, Link, ProcessedGames } from '../types/games.js';
import { TeamIdParams } from '../types/teams.js';

const prisma = new PrismaClient();

async function getTeamGames(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params as TeamIdParams;
    const teamPage: string = `https://fbref.com/en/squads/${id}`;
    const gamesData: ProcessedGames[] = await getGamesData(teamPage);
    response.status(200).json(gamesData);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function getTeamGamesBySeason(request: Request, response: Response): Promise<void> {
  try {
    const { id, seasons } = request.query;
    const seasonsArr = seasons.split(',');

    const gamesData = await fetchGamesData(id, seasonsArr);

    response.status(200).json(gamesData);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function getGamesData(teamPage: string): Promise<ProcessedGames[]> {
  try {
    const links: Link[] = await getGamesLinks(teamPage);

    const today: number = parseInt(format(new Date(), 'yyyyMMdd'));
    const filteredGames: Link[] = links.filter(link => parseInt(link.date) < today);

    const games: ScrappedGameData[] = await processGames(
      filteredGames,
      5,
      async (game) => await getGameData(game)
    );

    //const games = await Promise.all(playersStatsPromises);
    const createdGames: ProcessedGames[] = await processGamesSequentially(games);

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
