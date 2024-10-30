import puppeteer, { Browser, Page } from 'puppeteer';
import { createNewTeam, getTeamByName } from './../models/teamModel.js';
import { ScrappedGameData, Link } from '../types/games.js';
import { Managers } from '../types/managers.js';
import { Teams } from '@prisma/client';

const BASEURL: string = 'https://fbref.com/';

async function formatDate(inputDate: string): Promise<Date> {
  const year: string = inputDate.substring(0, 4);
  const month: string = inputDate.substring(4, 6);
  const day: string = inputDate.substring(6, 8);

  const formattedDate: Date = new Date(`${year}-${month}-${day}`);

  return formattedDate;
}

async function createTeam(teamName: string, isHomeTeam: boolean, gameLink: string) {
  try {
    const browser: puppeteer.Browser = await puppeteer.launch({ headless: 'new' });
    const page: puppeteer.Page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000 * 10);
    await page.goto(`${BASEURL}${gameLink}`);

    await page.setViewport({ width: 1080, height: 1024 });
    const selector: string = `#content > div.scorebox > div:nth-child(${isHomeTeam ? 1 : 2}) > div:nth-child(1) > strong > a`;

    await page.waitForSelector(selector);

    const teamLink: string = await page.evaluate((selector) => {
      return document.querySelector(selector).getAttribute('href');
    }, selector);
    await browser.close();

    const teamIdMatch: RegExpMatchArray = teamLink.match(/\/squads\/([^\/]+)/);
    const teamId: string = teamIdMatch[1];
    const team: Teams = await createNewTeam(teamId, teamName);
    
    return team;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getTeamId(teamName: string, isHomeTeam: boolean, gameLink: string): Promise<string> {
  let team: Teams | null  = await getTeamByName(teamName);
  if (!team) {
    team = await createTeam(teamName, isHomeTeam, gameLink);
  }
  return team.id;
}

async function getManagers(page: Page): Promise<Managers> {
  const managers: Managers = await page.evaluate(() => {
    const isLeague: boolean = document.querySelector<HTMLElement>('#content > div:nth-child(2)')!.innerText.includes('Matchweek');
    if (isLeague) {
      return {
        home: decodeURI(encodeURI(document.querySelector<HTMLElement>('#content > div.scorebox > div:nth-child(1) > div:nth-child(5)')!.innerText.split(': ')[1]).replaceAll('%C2%A0', ' ')),
        away: decodeURI(encodeURI(document.querySelector<HTMLElement>('#content > div.scorebox > div:nth-child(2) > div:nth-child(5)')!.innerText.split(': ')[1]).replaceAll('%C2%A0', ' '))
      };
    }
    return {
      home: decodeURI(encodeURI(document.querySelector<HTMLElement>('#content > div.scorebox > div:nth-child(1) > div:nth-child(4)')!.innerText.split(': ')[1]).replaceAll('%C2%A0', ' ')),
      away: decodeURI(encodeURI(document.querySelector<HTMLElement>('#content > div.scorebox > div:nth-child(2) > div:nth-child(4)')!.innerText.split(': ')[1]).replaceAll('%C2%A0', ' '))
    };
  });
  return managers;
}

async function getGameData(game: Link): Promise<ScrappedGameData> {
  try {
    const browser: Browser = await puppeteer.launch({ headless: 'new' });
    const page: Page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000 * 10);
    await page.goto(`${BASEURL}${game.gameLink}`);
    
    await page.setViewport({ width: 1080, height: 1024 });
    const managers: Managers = await getManagers(page);
    const stats: ScrappedGameData = await page.evaluate((game, managers) => {
      const selectors: string[] = [
        document.querySelector('#content > div.scorebox > div:nth-child(1) > div:nth-child(1) > strong > a').getAttribute('href').match(/\/squads\/([^\/]+)/)[1],
        document.querySelector('#content > div.scorebox > div:nth-child(2) > div:nth-child(1) > strong > a').getAttribute('href').match(/\/squads\/([^\/]+)/)[1]
      ];
      return {
        date: game.date,
        gameLink: game.gameLink,
        season: game.season,
        competition: document.querySelector('#content > div:nth-child(2) > a').innerHTML,
        homeTeam: document.querySelector('#content > div.scorebox > div:nth-child(1) > div > strong > a').innerHTML,
        awayTeam: document.querySelector('#content > div.scorebox > div:nth-child(2) > div > strong > a').innerHTML,
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
        }).flat(),
        homeManager: managers.home,
        awayManager: managers.away
      };
    }, game, managers);
    
    await browser.close();
    return stats;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getGamesLinks(teamPage: string): Promise<Link[]> {
  try {
    const browser: Browser = await puppeteer.launch({ headless: 'new' });
    const page: Page = await browser.newPage();
    
    await page.goto(teamPage);
    
    const links: Link[] = await page.evaluate(() => {
      const season: string = document.querySelector('#matchlogs_for_sh > h2 > span').innerHTML.substring(0, 9).match(/[0-9-]+/g).join('');
      const nodeList: NodeListOf<Element> = document.querySelectorAll('#matchlogs_for > tbody > tr > th > a');
      const hrefArray: Link[] = Array.from(nodeList)
      .filter(node => node.tagName === 'A')
      .map(link => {
        const cancelled: boolean = link.closest('tr').querySelector<HTMLElement>('td:nth-child(19)').innerHTML.toLowerCase().includes('cancelled');
        const awarded: boolean = link.closest('tr').querySelector<HTMLElement>('td:nth-child(19)').innerHTML.toLowerCase().includes('awarded');
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
