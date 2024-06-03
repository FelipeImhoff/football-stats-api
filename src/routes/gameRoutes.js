import { Router } from 'express'
import {
  getHomeManagers,
  getAwayManagers,
  getHomeTeams,
  getAwayTeams,
  getGamesData,
  getGamesStats,
  getTeamGames,
  getTeamGamesBySeason
} from '../controllers/gameController.js'

const router = Router()

router.get('/games/teamGames/:id', getTeamGames)
router.get('/games/teamGamesBySeason', getTeamGamesBySeason)
//Criar função para atualizar o banco inteiro
router.get('/getGamesData', getGamesData)
router.get('/homeManagers', getHomeManagers)
router.get('/awayManagers', getAwayManagers)
router.get('/homeTeams', getHomeTeams)
router.get('/awayTeams', getAwayTeams)
router.get('/gameStats', getGamesStats)

export default router