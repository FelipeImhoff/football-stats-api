import { calculateFairOdds, calculateStats } from "../services/statsService.js";
import {
  ScrappedGameData,
  Link,
  ProcessedGame,
  Stats,
} from "../types/games.js";
import {
  processGamesSequentially,
  sleep,
  teamHasPlayedCompetition,
} from "../Utils/gamesUtils.js";
import { processChampionship } from "../services/ProcessChampionship.js";
import {
  checkGameLinkExists,
  findDistinctCompetitions,
  getGames,
} from "../models/gameModel.js";
import { getGameData, getGamesLinks } from "../services/scraper.js";
import { getShouldUpdateTeam } from "../models/teamModel.js";
import { NextFunction, Request, Response } from "express";
import { processGames } from "../services/gameService.js";
import { Games, PrismaClient } from "@prisma/client";
import { Manager } from "../types/managers.js";
import { format } from "date-fns";

const prisma = new PrismaClient();

async function getTeamGames(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { id } = request.params as { id: string };
    const teamPage: string = `https://fbref.com/en/squads/${id}/all_comps`;
    const gamesData: ProcessedGame[] = await getGamesData(teamPage);
    response.status(200).json(gamesData);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function getTeamGamesBySeason(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { id, season } = request.params as { id: string; season: string };
    const teamPage: string = `https://fbref.com/en/squads/${id}/${season}/all_comps`;

    const gamesData: ProcessedGame[] = await getGamesData(teamPage);

    response.status(200).json(gamesData);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function getGamesData(
  teamPage: string,
  date?: string
): Promise<ProcessedGame[]> {
  try {
    console.log(teamPage);
    const links: Link[] = await getGamesLinks(teamPage);
    const today: number = parseInt(format(new Date(), "yyyyMMdd"));
    const linksWithExistence: Link[] = await Promise.all(
      links.map(async (link) => ({
        ...link,
        exists: await checkGameLinkExists(link.gameLink),
      }))
    );
    let filteredGames: Link[] = [];
    if (date) {
      filteredGames = linksWithExistence.filter(
        (link) =>
          parseInt(link.date) < today &&
          !link.exists &&
          parseInt(link.date) > parseInt(date)
      );
    } else {
      filteredGames = linksWithExistence.filter(
        (link) => parseInt(link.date) < today && !link.exists
      );
    }

    const games: ScrappedGameData[] = await processGames(
      filteredGames,
      3,
      async (game) => await getGameData(game)
    );

    const createdGames: ProcessedGame[] = await processGamesSequentially(games);

    return createdGames || null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getHomeManagers(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const data: Manager[] = await prisma.games.findMany({
      select: {
        id: true,
        homeManager: true,
      },
      distinct: ["homeManager"],
      orderBy: {
        homeManager: "asc",
      },
    });
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getAwayManagers(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const data: Manager[] = await prisma.games.findMany({
      select: {
        id: true,
        awayManager: true,
      },
      distinct: ["awayManager"],
      orderBy: {
        awayManager: "asc",
      },
    });
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json(error);
  }
}

async function getGamesStats(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const { game } = request.query as { game?: string };
    const parsedGame = game === undefined ? {} : JSON.parse(game as string);

    const games: Games[] = await getGames(parsedGame);

    const stats: Stats = await calculateStats(games);

    await calculateFairOdds(stats);
    response.status(200).json(stats);
  } catch (error) {
    response.status(500).json(error);
  }
}

// Futuramente quando estiver rodando diariamente fixar valor date
async function sync(request: Request, response: Response): Promise<void> {
  try {
    const { date } = request.body;
    const teamsIds = await getShouldUpdateTeam();
    const newGames: ProcessedGame[] = [];

    for (let [index, team] of teamsIds.entries()) {
      const teamPage: string = `https://fbref.com/en/squads/${team.id}/all_comps`;
      const gamesData: ProcessedGame[] = await getGamesData(teamPage, date);
      newGames.push(...gamesData);
      if (index % 5 === 0) {
        console.log("timeout");
        sleep(29 * 1000);
      }
    }

    response.status(200).json(newGames);
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

async function getInsights(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { homeTeamId, awayTeamId, homeManager, awayManager, competition } =
      request.query;

    if (
      typeof homeTeamId !== "string" ||
      typeof awayTeamId !== "string" ||
      typeof homeManager !== "string" ||
      typeof awayManager !== "string" ||
      typeof competition !== "string"
    ) {
      response.status(400).json({ error: "Parametro invalidos" });
      return;
    }

    const homeTeamHasPlayedCompetitionPromise: Promise<boolean> =
      teamHasPlayedCompetition(homeTeamId, competition);
    const awayTeamHasPlayedCompetitionPromise: Promise<boolean> =
      teamHasPlayedCompetition(awayTeamId, competition);

    const [homeTeamHasPlayedCompetition, awayTeamHasPlayedCompetition] =
      await Promise.all([
        homeTeamHasPlayedCompetitionPromise,
        awayTeamHasPlayedCompetitionPromise,
      ]);

    if (!homeTeamHasPlayedCompetition || !awayTeamHasPlayedCompetition) {
      response.status(400).json({
        error: "Correlação entre times e campeonato não encontrada",
      });
      return;
    }

    const homeTeamRequest = {
      homeTeamId,
      homeManager,
    };

    const homeTeamGames: Games[] = await getGames(homeTeamRequest);
    const homeTeamStatsPromise: Promise<Stats> = calculateStats(homeTeamGames);

    const awayTeamRequest = {
      awayTeamId,
      awayManager,
    };

    const awayTeamGames: Games[] = await getGames(awayTeamRequest);
    const awayTeamStatsPromise: Promise<Stats> = calculateStats(awayTeamGames);

    const [homeTeamStats, awayTeamStats] = await Promise.all([
      homeTeamStatsPromise,
      awayTeamStatsPromise,
    ]);

    if (homeTeamStats.games < 8 || awayTeamStats.games < 8) {
      response.status(400).json({
        error: "Com esses filtros os times não tem quantidade mínima de jogos",
      });
      return;
    }

    const result = processChampionship(
      competition,
      homeTeamStats,
      awayTeamStats
    );
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getCompetitions(
  request: Request,
  response: Response
): Promise<void> {
  try {
    const competitions = await findDistinctCompetitions();
    const competitionNames = competitions.map(
      (competition) => competition.competition
    );

    response.status(200).json(competitionNames);
    return;
  } catch (error) {
    console.error(error);
    response.status(500).json(error);
  }
}

export {
  getGamesData,
  getHomeManagers,
  getAwayManagers,
  getGamesStats,
  getTeamGames,
  getTeamGamesBySeason,
  sync,
  getInsights,
  getCompetitions,
};
