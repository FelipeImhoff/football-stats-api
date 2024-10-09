import { createGame } from '../models/gameModel.js';
import { ProcessedGame, ScrappedGameData } from '../types/games.js';

function sleep(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function processGamesSequentially(games: ScrappedGameData[]): Promise<ProcessedGame[]> {
  const processedGames: ProcessedGame[] = [];
  for (const game of games) {
    const createdGame: ProcessedGame = await createGame(game);
    processedGames.push(createdGame);
  }
  return processedGames;
}

export {
  sleep,
  processGamesSequentially
}