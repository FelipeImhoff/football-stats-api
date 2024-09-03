import { getGamesData } from '../controllers/gameController.js';
import { ScrappedGameData, Link } from '../types/games.js';
import { sleep } from './utils.js';

async function processGames(
  links: Link[],
  batchSize: number,
  callback: (link: Link) => Promise<ScrappedGameData>
): Promise<ScrappedGameData[]> {
  let result: ScrappedGameData[] = [];

  for (let i = 0; i < links.length; i += batchSize) {
    const batch: Link[] = links.slice(i, i + batchSize);
    result = result.concat(
      await Promise.all(
        batch.map(async (link: Link) => {
          return await callback(link);
        })
      )
    );
    await sleep(10000); // Aguarda 10 segundos entre os lotes
  }

  return result;
}

async function fetchGamesData(teamId: string, seasons: string[]): Promise<any[]> {
  const gamesData: any[] = [];

  for (const season of seasons) {
    const teamPage = `https://fbref.com/en/squads/${teamId}/${season}`;
    const data = await getGamesData(teamPage);
    gamesData.push(data);
  }

  return Promise.all(gamesData);
}


export {
  processGames,
  fetchGamesData
}