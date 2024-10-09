import { Games, PrismaClient, Teams } from '@prisma/client';
import { Request, Response } from 'express';
import { getGameData, getGamesLinks } from '../models/gameModel.js';
import { format } from 'date-fns';
import { processGames } from '../services/gameService.js';
import { processGamesSequentially } from '../services/utils.js';
import { ScrappedGameData, Link, ProcessedGame, Stats } from '../types/games.js';
import { Manager } from '../types/managers.js';
import { Team } from '../types/teams.js';

const prisma = new PrismaClient();

async function getTeamGames(request: Request, response: Response): Promise<void> {
  try {
    const { id } = request.params as {id: string};
    const teamPage: string = `https://fbref.com/en/squads/${id}/all_comps`;
    const gamesData: ProcessedGame[] = await getGamesData(teamPage);
    response.status(200).json(gamesData);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function getTeamGamesBySeason(request: Request, response: Response): Promise<void> {
  try {
    const { id, season } = request.params as {id: string, season: string };
    const teamPage: string = `https://fbref.com/en/squads/${id}/${season}/all_comps`;


    const gamesData: ProcessedGame[] = await getGamesData(teamPage);

    response.status(200).json(gamesData);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function getGamesData(teamPage: string): Promise<ProcessedGame[]> {
  try {
    const links: Link[] = await getGamesLinks(teamPage);

    const today: number = parseInt(format(new Date(), 'yyyyMMdd'));
    const filteredGames: Link[] = links.filter(link => parseInt(link.date) < today);

    const games: ScrappedGameData[] = await processGames(
      filteredGames,
      3,
      async (game) => await getGameData(game)
    );

    //const games = await Promise.all(playersStatsPromises);
    const createdGames: ProcessedGame[] = await processGamesSequentially(games);

    return createdGames || null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getHomeManagers(request: Request, response: Response): Promise<void> {
  try {
    const data: Manager[] = await prisma.games.findMany({
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
    const data: Manager[] = await prisma.games.findMany({
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

async function getTeams(request: Request, response: Response): Promise<void> {
  try {
    const data: Team[] = await prisma.teams.findMany({
      select: {
        id: true,
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    });
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getGamesStats(request: Request, response: Response): Promise<void> {
  try {
    const { game } = request.query as {game?: string};
    const parsedGame = game === undefined ? {} : JSON.parse(game as string);

    const games: Games[] = await prisma.games.findMany({
      where: {
        ...parsedGame,
      },
    });

    const gamesAmount: number = games.length;
    let homeWins: number = 0;
    let awayWins: number = 0;
    let draws: number = 0;
    let bothScored: number = 0;
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

    for(const game of games) {
      if (game.winner !== 'Draw') {
        const team: Teams = await prisma.teams.findFirst({
          where: {
            id: game.homeTeamId
          }
        })
        game.winner === team.name ? homeWins++ : awayWins++;
      } else {
        draws++;
      }
      homeTeamGoals.push(game.homeTeamGoals);
      awayTeamGoals.push(game.awayTeamGoals);
      if (game.homeTeamGoals > 0 || game.awayTeamGoals > 0) {
        const totalGoals: number = game.homeTeamGoals + game.awayTeamGoals;

        for (let i: number = 0; i < Math.min(totalGoals, Object.keys(gameTotalOver).length); i++) {
          gameTotalOver[`atLeast${i + 1}`]++;
        }

        if (game.homeTeamGoals > 0 && game.awayTeamGoals > 0) bothScored++;
      }

      for (let i: number = 0; i < Math.min(game.homeTeamGoals, Object.keys(homeTeamOver).length); i++) {
        homeTeamOver[`atLeast${i + 1}`]++;
      }
      for (let i: number = 0; i < Math.min(game.awayTeamGoals, Object.keys(awayTeamOver).length); i++) {
        awayTeamOver[`atLeast${i + 1}`]++;
      }
    };    

    const stats: Stats = {
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

    response.status(200).json(stats);
  } catch (error) {
    response.status(500).json(error);
  }
}

export {
  getGamesData,
  getHomeManagers,
  getAwayManagers,
  getTeams,
  getGamesStats,
  getTeamGames,
  getTeamGamesBySeason,
};
