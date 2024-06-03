import { launch } from 'puppeteer'
import { createNewTeam, getTeamByName } from './teamModel.js'
import { PrismaClient } from '@prisma/client'

const BASEURL = 'https://fbref.com/'
const prisma = new PrismaClient()

async function formatDate(inputDate) {
  const year = inputDate.substring(0, 4)
  const month = inputDate.substring(4, 6)
  const day = inputDate.substring(6, 8)

  const formattedDate = new Date(`${year}-${month}-${day}`)

  const formattedDateString = formattedDate.toISOString()

  return formattedDateString
}

async function createTeam(teamName, isHomeTeam, gameLink) {
  try {
    const browser = await launch({ headless: 'new' })
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(60000 * 10)
    await page.goto(`${BASEURL}${gameLink}`)

    await page.setViewport({ width: 1080, height: 1024 })
    const selector = `#content > div.scorebox > div:nth-child(${isHomeTeam ? 1 : 2}) > div:nth-child(1) > strong > a`

    await page.waitForSelector(selector)

    const teamLink = await page.evaluate(async (selector) => {
      return document.querySelector(selector).getAttribute('href')
    }, selector)
    await browser.close()

    const teamIdMatch = teamLink.match(/\/squads\/([^\/]+)/)
    const teamId = teamIdMatch[1]
    const team = await createNewTeam(teamId, teamName)

    return team
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getTeamId(teamName, isHomeTeam, gameLink) {
  let team = await getTeamByName(teamName)
  if (!team) {
    team = await createTeam(teamName, isHomeTeam, gameLink)
  }
  return team.id
}

async function createGame({ date, homeTeam, awayTeam, homeTeamGoals, awayTeamGoals,
  gameStats, homeManager, awayManager, gameLink, season, competition }) {
  let createdGame, createdGameStats
  const homeGoalsInt = parseInt(homeTeamGoals)
  const awayGoalsInt = parseInt(awayTeamGoals)
  const homeTeamId = await getTeamId(homeTeam, true, gameLink)
  const awayTeamId = await getTeamId(awayTeam, false, gameLink)

  const game = {
    date: await formatDate(date),
    winner: homeGoalsInt > awayGoalsInt ? homeTeam : (homeGoalsInt < awayGoalsInt ? awayTeam : 'Draw'),
    homeTeamId,
    awayTeamId,
    homeTeamGoals: homeGoalsInt,
    awayTeamGoals: awayGoalsInt,
    homeManager,
    awayManager,
    link: gameLink,
    season,
    competition
  }

  const gameFound = await prisma.games.findFirst({
    where: {
      ...game
    }
  })


  if (!gameFound) {
    createdGame = await prisma.games.create({
      data: {
        ...game
      }
    })

    createdGameStats = await Promise.all(gameStats.map(player => {
      return prisma.playersStats.create({
        data: {
          name: player.name,
          game_id: createdGame.id,
          minutesPlayed: parseInt(player.minutesPlayed),
          goals: parseInt(player.goals),
          assists: parseInt(player.assits),
          convertedPenalties: parseInt(player.convertedPenalties),
          attemptedPenalties: parseInt(player.attemptedPenalties),
          shots: parseInt(player.shots),
          shotsOnTarget: parseInt(player.shotsOnTarget),
          xG: parseFloat(player.xG) || 0.0,
          npxG: parseFloat(player.npxG) || 0.0,
          xAG: parseFloat(player.xAG) || 0.0,
        },
      })
    }))

    return { createdGame, createdGameStats }
  }

  createdGame = 'Game already exists'
  createdGameStats = 'GameStats already exists'

  return { createdGame, createdGameStats }
}

async function getManagers(page) {
  const managers = await page.evaluate(() => {
    isLeague = document.querySelector('#content > div:nth-child(2)').innerText.includes('Matchweek')
    if (isLeague) {
      return {
        home: decodeURI(encodeURI(document.querySelector('#content > div.scorebox > div:nth-child(1) > div:nth-child(5)').innerText.split(': ')[1]).replaceAll('%C2%A0', ' ')),
        away: decodeURI(encodeURI(document.querySelector('#content > div.scorebox > div:nth-child(2) > div:nth-child(5)').innerText.split(': ')[1]).replaceAll('%C2%A0', ' '))
      }
    }
    return {
      home: decodeURI(encodeURI(document.querySelector('#content > div.scorebox > div:nth-child(1) > div:nth-child(4)')?.innerText.split(': ')[1]).replaceAll('%C2%A0', ' ')),
      away: decodeURI(encodeURI(document.querySelector('#content > div.scorebox > div:nth-child(2) > div:nth-child(4)')?.innerText.split(': ')[1]).replaceAll('%C2%A0', ' '))
    }
  })
  return managers
}

//PEGAR STATS DO TIME VISITANTE
//HOMETEAM = TEAMSELECTOR E PEGAR AWAYTEAM
async function getGameData(game, __dirname) {
  try {
    const browser = await launch({ headless: 'new' })
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(60000 * 10)
    await page.goto(`${BASEURL}${game.gameLink}`)

    await page.setViewport({ width: 1080, height: 1024 })
    const managers = await getManagers(page)
    const stats = await page.evaluate(async (game) => {
      const selectors = [
        document.querySelector('#content > div.scorebox > div:nth-child(1) > div:nth-child(1) > strong > a').getAttribute('href').match(/\/squads\/([^\/]+)/)[1],
        document.querySelector('#content > div.scorebox > div:nth-child(2) > div:nth-child(1) > strong > a').getAttribute('href').match(/\/squads\/([^\/]+)/)[1]
      ]
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
                assits: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(8)`).innerHTML,
                convertedPenalties: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(9)`).innerHTML,
                attemptedPenalties: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(10)`).innerHTML,
                shots: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(11)`).innerHTML,
                shotsOnTarget: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(12)`).innerHTML,
                xG: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(19)`).innerHTML,
                npxG: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(20)`).innerHTML,
                xAG: player.querySelector(`#stats_${teamSelector}_summary > tbody > tr > td:nth-child(21)`).innerHTML
              }
            })
        }).flat()
      }
    }, game)
    stats.homeManager = managers.home
    stats.awayManager = managers.away

    await browser.close()
    return stats
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getGamesLinks(teamPage) {
  try {
    const browser = await launch({ headless: 'new' })
    const page = await browser.newPage()

    const pageReturn = await page.goto(teamPage)
    if (pageReturn.status() === 429) return { code: 429, message: 'Bloqued IP!' }

    const links = await page.evaluate(() => {
      const season = document.querySelector('#content > div:nth-child(5) > h4').innerText.substring(0, 9).match(/[0-9-]+/g).join('')
      const nodeList = document.querySelectorAll('#matchlogs_for > tbody > tr > th > a')
      const hrefArray = Array.from(nodeList)
        .filter(node => node.tagName === 'A')
        .map(link => {
          const cancelled = link.closest('tr').querySelector('td:nth-child(19)').innerText.toLowerCase().includes('cancelled')
          const awarded = link.closest('tr').querySelector('td:nth-child(19)').innerText.toLowerCase().includes('awarded')
          if (cancelled || awarded) {
            return undefined
          }
          return {
            gameLink: link.getAttribute('href'),
            date: link.closest('tr').querySelector('th').getAttribute('csk'),
            season
          }
        }).filter(link => link !== undefined)

      return hrefArray
    })

    await browser.close()
    return links
  } catch (error) {
    console.error(error)
    throw error
  }
}

export {
  createGame,
  getGamesLinks,
  getGameData
}
