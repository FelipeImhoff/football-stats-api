import { ScrappedGameData, Link } from '../types/games.js';
import { sleep } from './utils.js';

async function processGames(
  links: Link[],
  batchSize: number,
  callback: (link: Link) => Promise<ScrappedGameData>
): Promise<ScrappedGameData[]> {
  let result: ScrappedGameData[] = [];

  for (let i = 0; i < links.length; i += batchSize) {
    console.log(`${((i / links.length) * 100).toFixed(2)}% (${i}/${links.length})`)
    const batch: Link[] = links.slice(i, i + batchSize);
    result = result.concat(
      await Promise.all(
        batch.map(async (link: Link) => {
          return await callback(link);
        })
      )
    );
    await sleep(30000);
  }

  return result;
}


export {
  processGames,
}