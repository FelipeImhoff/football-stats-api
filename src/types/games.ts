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

export interface ProcessedGames {
  createdGame: Games | string;
  createdGameStats: PlayersStats[] | string;
}