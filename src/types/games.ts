import { Games, PlayersStats } from '@prisma/client';
import { GameStats } from './players.js';

export interface Link {
  gameLink: string;
  date: string;
  season: string;
}

export interface ScrappedGameData {
  date: string;
  gameLink: string;
  season: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamGoals: string;
  awayTeamGoals: string;
  homeManager: string;
  awayManager: string;
  gameStats: GameStats[];
}

export interface GameWithoutId extends Omit<Games, 'id'> {}

export interface ProcessedGame {
  createdGame: Games | string;
  createdGameStats: PlayersStats[] | string;
}

export interface Stats {
  games: number,
  homeTeamWins: number,
  draws: number,
  awayTeamWins: number,
  homeTeamWinPercentage: string,
  homeOrAwayWinPercentage: string,
  homeOrDrawsPercentage: string,
  drawsPercentage: string,
  awayOrDrawsPercentage: string,
  awayTeamWinPercentage: string,
  homeTeamGoalsAverage: string,
  awayTeamGoalsAverage: string,
  bothScored: number,
  bothScoredPercentual: string,
  notBothScoredPercentual: string,
  homeTeamMinGoals: number,
  awayTeamMinGoals: number,
  homeTeamMaxGoals: number,
  awayTeamMaxGoals: number,
  homeTeamGoalsOver: { [key: string]: number },
  homeTeamGoalsOverPercentage: {
    atLeast1: string,
    atLeast2: string,
    atLeast3: string,
    atLeast4: string,
    atLeast5: string,
  },
  awayTeamGoalsOver: { [key: string]: number },
  awayTeamGoalsOverPercentage: {
    atLeast1: string,
    atLeast2: string,
    atLeast3: string,
    atLeast4: string,
    atLeast5: string,
  },
  gameTotalOver: { [key: string]: number },
  gameTotalOverPercentage: {
    atLeast1: string,
    atLeast2: string,
    atLeast3: string,
    atLeast4: string,
    atLeast5: string,
  }
}