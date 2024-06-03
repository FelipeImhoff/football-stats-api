import { launch } from 'puppeteer';
import { createNewTeam, getTeamByName } from './../models/teamModel';

const BASEURL = 'https://fbref.com/';

async function formatDate(inputDate: string): Promise<string> {
  const year = inputDate.substring(0, 4);
  const month = inputDate.substring(4, 6);
  const day = inputDate.substring(6, 8);

  const formattedDate = new Date(`${year}-${month}-${day}`);

  return formattedDate.toISOString();
}

async function createTeam(teamName: string, isHomeTeam: boolean, gameLink: string) {
  try {
    const browser = await launch({ headless: 'new' });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000 * 10);
    await page.goto(`${BASEURL}${gameLink}`);

    await page.setViewport({ width: 1080, height: 1024 });
    const selector = `#content > div.scorebox > div:nth-child(${isHomeTeam ? 1 : 2}) > div:nth-child(1) > strong > a`;

    await page.waitForSelector(selector);

    const teamLink = await page.evaluate((selector) => {
      return document.querySelector(selector).getAttribute('href');
    }, selector);
    await browser.close();

    const teamIdMatch = teamLink.match(/\/squads\/([^\/]+)/);
    const teamId = teamIdMatch[1];
    const team = await createNewTeam(teamId, teamName);

    return team;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTeamId(teamName: string, isHomeTeam: boolean, gameLink: string) {
  let team = await getTeamByName(teamName);
  if (!team) {
    team = await createTeam(teamName, isHomeTeam, gameLink);
  }
  return team.id;
}

async function getManagers(page) {
  const managers = await page.evaluate(() => {
    const isLeague = document.querySelector('#content > div:nth-child(2)').innerText.includes('Matchweek');
    if (isLeague) {
      return {
        home: decodeURI(encodeURI(document.querySelector('#content > div.scorebox > div:nth-child(1) > div:nth-child(5)').innerText.split(': ')[1]).replaceAll('%C2%A0', ' ')),
        away: decodeURI(encodeURI(document.querySelector('#content > div.scorebox > div:nth-child(2) > div:nth-child(5)').innerText.split(': ')[1]).replaceAll('%C2%A0', ' '))
      };
    }
    return {
      home: decodeURI(encodeURI(document.querySelector('#content > div.scorebox > div:nth-child(1) > div:nth-child(4)').innerText.split(': ')[1]).replaceAll('%C2%A0', ' ')),
      away: decodeURI(encodeURI(document.querySelector('#content > div.scorebox > div:nth-child(2) > div:nth-child(4)').innerText.split(': ')[1]).replaceAll('%C2%A0', ' '))
    };
  });
  return managers;
}

async function getGameData(game, __dirname) {
  try {
    const browser = await launch({ headless: 'new' });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000 * 10);
    await page.goto(`${BASEURL}${game.gameLink}`);

    await page.setViewport({ width: 1080, height: 1024 });
    const managers = await getManagers(page);
    const stats = await page.evaluate((game) => {
      const selectors = [
        document.querySelector('#content > div.scorebox > div:nth-child(1) > div:nth-child(1) > strong > a').getAttribute('href').match(/\/squads\/([^\/]+)/)[1],
        document.querySelector('#content > div.scorebox > div:nth-child(2) > div:nth-child(1) > strong > a').getAttribute('href').match(/\/squads\/([^\/]+)/)[1]
      ];
      return {
        date: game.date,
        gameLink: game.gameLink,
        season: game.season,
        competition: document.querySelector('#content > div:nth-child(2) > a').innerText,
        homeTeam: document.querySelector('#content > div.scorebox > div:nth-child(1) > div > strong > a').innerText,
        awayTeam: document.querySelector('#content > div.scorebox > div:nth-child(2) > div > strong > a').innerText,
        homeTeamGoals: document.querySelector('#content > div.scorebox > div:nth-child(1) > div.scores > div.score').innerHTML.replace(/\D/g, ''),
        awayTeamGoals: document.querySelector('#content > div.scorebox > div:nth-child(2) > div.scores > div.score').innerHTML.replace(/\D/g, ''),
        gameStats: selectors.map(teamSelector => {
          return Array.from(document.querySelectorAll(`#stats_${teamSelector}_summary > tbody > tr`))
            .map(player => {
              return {
                name: player.querySelector('th > a').innerHTML,
                minutesPlayed: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(6)`).innerHTML,
                goals: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(7)`).innerHTML,
                assists: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(8)`).innerHTML,
                convertedPenalties: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(9)`).innerHTML,
                attemptedPenalties: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(10)`).innerHTML,
                shots: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(11)`).innerHTML,
                shotsOnTarget: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(12)`).innerHTML,
                xG: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(19)`).innerHTML,
                npxG: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(20)`).innerHTML,
                xAG: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(21)`).innerHTML
              };
            });
        }).flat()
      };
    }, game);
    stats.homeManager = managers.home;
    stats.awayManager = managers.away;

    await browser.close();
    return stats;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getGamesLinks(teamPage: string) {
  try {
    const browser = await launch({ headless: 'new' });
    const page = await browser.newPage();

    const pageReturn = await page.goto(teamPage);
    if (pageReturn.status() === 429) return { code: 429, message: 'Bloqued IP!' };

    const links = await page.evaluate(() => {
      const season = document.querySelector('#content > div:nth-child(5) > h4').innerText.substring(0, 9).match(/[0-9-]+/g).join('');
      const nodeList = document.querySelectorAll('#matchlogs_for > tbody > tr > th > a');
      const hrefArray = Array.from(nodeList)
        .filter(node => node.tagName === 'A')
        .map(link => {
          const cancelled = link.closest('tr').querySelector('td:nth-child(19)').innerText.toLowerCase().includes('cancelled');
          const awarded = link.closest('tr').querySelector('td:nth-child(19)').innerText.toLowerCase().includes('awarded');
          if (cancelled || awarded) {
            return undefined;
          }
          return {
            gameLink: link.getAttribute('href'),
            date: link.closest('tr').querySelector('th').getAttribute('csk'),
            season
          };
        }).filter(link => link !== undefined);

      return hrefArray;
    });

    await browser.close();
    return links;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export {
  formatDate,
  createTeam,
  getTeamId,
  getManagers,
  getGameData,
  getGamesLinks
};
