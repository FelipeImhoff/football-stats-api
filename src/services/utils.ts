import { createGame } from '../models/gameModel.js';
import { ProcessedGames, ScrappedGameData } from '../types/games.js';

function sleep(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function processGamesSequentially(games: ScrappedGameData[]): Promise<ProcessedGames[]> {
  const processedGames: ProcessedGames[] = [];
  for (const game of games) {
    const createdGame: ProcessedGames = await createGame(game);
    processedGames.push(createdGame);
  }
  return processedGames;
}

export {
  sleep,
  processGamesSequentially
}