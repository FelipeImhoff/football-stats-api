import { Router } from "express"
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', (request, response) => {
  try {
    response.send('API está rodando normalmente')
  } catch (err) {
    console.error(err)
    response.send(err)
  }
})

router.get('/gamestats', async (request, response) => {
  const { game } = request.query

  const parsedGame = game === undefined ? {} : JSON.parse(game)

  const games = await prisma.games.findMany({
    where: {
      ...parsedGame,
    }
  })

  const gamesAmount = games.length
  let homeWins = 0
  let awayWins = 0
  let draws = 0
  let bothScored = 0
  const homeTeamGoals = []
  const awayTeamGoals = []
  const gameTotalOver = {
    atLeast1: 0,
    atLeast2: 0,
    atLeast3: 0,
    atLeast4: 0,
    atLeast5: 0,
  }
  const homeTeamOver = {
    atLeast1: 0,
    atLeast2: 0,
    atLeast3: 0,
    atLeast4: 0,
    atLeast5: 0,
  }
  const awayTeamOver = {
    atLeast1: 0,
    atLeast2: 0,
    atLeast3: 0,
    atLeast4: 0,
    atLeast5: 0,
  }

  games.forEach(async (game) => {
    if (game.winner !== 'Draw') {
      if (game.winner === game.homeTeam) homeWins++
      if (game.winner === game.awayTeam) awayWins++
    } else {
      draws++
    }
    homeTeamGoals.push(game.homeTeamGoals)
    awayTeamGoals.push(game.awayTeamGoals)
    if (game.homeTeamGoals > 0 || game.awayTeamGoals > 0) {
      const totalGoals = game.homeTeamGoals + game.awayTeamGoals

      for (let i = 0; i < Math.min(totalGoals, Object.keys(gameTotalOver).length); i++) {
        gameTotalOver[`atLeast${i + 1}`]++
      }

      if (game.homeTeamGoals > 0 && game.awayTeamGoals > 0) bothScored++
    }



    for (let i = 0; i < Math.min(game.homeTeamGoals, Object.keys(homeTeamOver).length); i++) {
      homeTeamOver[`atLeast${i + 1}`]++
    }
    for (let i = 0; i < Math.min(game.awayTeamGoals, Object.keys(awayTeamOver).length); i++) {
      awayTeamOver[`atLeast${i + 1}`]++
    }
  })

  const data = {
    games: gamesAmount,
    homeTeamWins: homeWins,
    draws: draws,
    awayTeamWins: awayWins,
    homeTeamWinPercentage: ((homeWins / gamesAmount) * 100).toFixed(2),
    homeAndDrawsPercentage: (((homeWins + draws) / gamesAmount) * 100).toFixed(2),
    drawsPercentage: ((draws / gamesAmount) * 100).toFixed(2),
    awayAndDrawsPercentage: (((awayWins + draws) / gamesAmount) * 100).toFixed(2),
    awayTeamWinPercentage: ((awayWins / gamesAmount) * 100).toFixed(2),
    homeAwayWinPercentage: (((homeWins + awayWins) / gamesAmount) * 100).toFixed(2),
    homeTeamGoalsAverage: (homeTeamGoals.reduce((a, b) => a + b, 0) / gamesAmount).toFixed(2),
    awayTeamGoalsAverage: (awayTeamGoals.reduce((a, b) => a + b, 0) / gamesAmount).toFixed(2),
    bothScored,
    bothScoredPercentual: ((bothScored / gamesAmount) * 100).toFixed(2),
    notBothScoredPercentual: ((1 - (bothScored / gamesAmount)) * 100).toFixed(2),
    homeTeamMinGoals: Math.min(...homeTeamGoals),
    awayTeamMinGoals: Math.min(...awayTeamGoals),
    homeTeamMaxGoals: Math.max(...homeTeamGoals),
    awayTeamMaxGoals: Math.max(...awayTeamGoals),
    homeTeamGoalsOver: homeTeamOver,
    homeTeamGoalsOverPercentage: {
      atLeast1: ((homeTeamOver.atLeast1 / gamesAmount) * 100).toFixed(2),
      atLeast2: ((homeTeamOver.atLeast2 / gamesAmount) * 100).toFixed(2),
      atLeast3: ((homeTeamOver.atLeast3 / gamesAmount) * 100).toFixed(2),
      atLeast4: ((homeTeamOver.atLeast4 / gamesAmount) * 100).toFixed(2),
      atLeast5: ((homeTeamOver.atLeast5 / gamesAmount) * 100).toFixed(2),
    },
    awayTeamGoalsOver: awayTeamOver,
    awayTeamGoalsOverPercentage: {
      atLeast1: ((awayTeamOver.atLeast1 / gamesAmount) * 100).toFixed(2),
      atLeast2: ((awayTeamOver.atLeast2 / gamesAmount) * 100).toFixed(2),
      atLeast3: ((awayTeamOver.atLeast3 / gamesAmount) * 100).toFixed(2),
      atLeast4: ((awayTeamOver.atLeast4 / gamesAmount) * 100).toFixed(2),
      atLeast5: ((awayTeamOver.atLeast5 / gamesAmount) * 100).toFixed(2),
    },
    gameTotalOver,
    gameTotalOverPercentage: {
      atLeast1: ((gameTotalOver.atLeast1 / gamesAmount) * 100).toFixed(2),
      atLeast2: ((gameTotalOver.atLeast2 / gamesAmount) * 100).toFixed(2),
      atLeast3: ((gameTotalOver.atLeast3 / gamesAmount) * 100).toFixed(2),
      atLeast4: ((gameTotalOver.atLeast4 / gamesAmount) * 100).toFixed(2),
      atLeast5: ((gameTotalOver.atLeast5 / gamesAmount) * 100).toFixed(2),
    }
  }

  response.status(200).json(data)
})

router.get('/playerstats', async (request, response) => {
  const { gameParams, playerParams } = request.query

  const parsedGameParams = gameParams === undefined ? null : JSON.parse(gameParams)
  const parsedPlayerParams = playerParams === undefined ? null : JSON.parse(playerParams)

  try {
    const data = await prisma.gameStats.findMany({
      where: {
        ...parsedPlayerParams,
        game: {
          ...parsedGameParams,
        }
      }
    })

    const playersStats = []

    data.forEach(gameStat => {
      const index = playersStats.findIndex(player => player.name === gameStat.name)

      if (index >= 0) {
        const playerStat = playersStats[index]
        playerStat.minutesPlayed += gameStat.minutesPlayed
        playerStat.appearances++
        playerStat.goals += gameStat.goals
        playerStat.assits += gameStat.assits
        playerStat.convertedPenalties += gameStat.convertedPenalties
        playerStat.attemptedPenalties += gameStat.attemptedPenalties
        playerStat.shots += gameStat.shots
        playerStat.shotsOnTarget += gameStat.shotsOnTarget
        playerStat.xG += gameStat.xG
        playerStat.npxG += gameStat.npxG
        playerStat.xAG += gameStat.xAG

        return
      }

      playersStats.push({
        name: gameStat.name,
        minutesPlayed: gameStat.minutesPlayed,
        appearances: 1,
        goals: gameStat.goals,
        assits: gameStat.assits,
        convertedPenalties: gameStat.convertedPenalties,
        attemptedPenalties: gameStat.attemptedPenalties,
        shots: gameStat.shots,
        shotsOnTarget: gameStat.shotsOnTarget,
        xG: gameStat.xG,
        npxG: gameStat.npxG,
        xAG: gameStat.xAG,
      })

      return
    })

    playersStats.forEach(player => {
      player.averageMinutesPerGame = Math.round(player.minutesPlayed / player.appearances)
      player.perNinetyMinutes = {
        goals: (player.goals / (player.minutesPlayed / 90)).toFixed(2),
        assits: (player.assits / (player.minutesPlayed / 90)).toFixed(2),
        convertedPenalties: (player.convertedPenalties / (player.minutesPlayed / 90)).toFixed(2),
        attemptedPenalties: (player.attemptedPenalties / (player.minutesPlayed / 90)).toFixed(2),
        shots: (player.shots / (player.minutesPlayed / 90)).toFixed(2),
        shotsOnTarget: (player.shotsOnTarget / (player.minutesPlayed / 90)).toFixed(2),
        xG: (player.xG / (player.minutesPlayed / 90)).toFixed(2),
        npxG: (player.npxG / (player.minutesPlayed / 90)).toFixed(2),
        xAG: (player.xAG / (player.minutesPlayed / 90)).toFixed(2),
      }

      player.perGame = {
        goals: (player.goals / player.appearances).toFixed(2),
        assits: (player.assits / player.appearances).toFixed(2),
        convertedPenalties: (player.convertedPenalties / player.appearances).toFixed(2),
        attemptedPenalties: (player.attemptedPenalties / player.appearances).toFixed(2),
        shots: (player.shots / player.appearances).toFixed(2),
        shotsOnTarget: (player.shotsOnTarget / player.appearances).toFixed(2),
        xG: (player.xG / player.appearances).toFixed(2),
        npxG: (player.npxG / player.appearances).toFixed(2),
        xAG: (player.xAG / player.appearances).toFixed(2),
      }
      return player
    })

    response.status(200).json(playersStats)
  } catch (error) {
    response.status(500).json(error)
  }
})

export default router