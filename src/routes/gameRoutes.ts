import { Router } from 'express';
import * as gameController from '../controllers/gameController.js';

const router = Router();

router.get('/games/teamGames/:id', gameController.getTeamGames); //DONE
router.get('/games/teamGamesBySeason', gameController.getTeamGamesBySeason);
router.get('/getGamesData', gameController.getGamesData);
router.get('/homeManagers', gameController.getHomeManagers);
router.get('/awayManagers', gameController.getAwayManagers);
router.get('/homeTeams', gameController.getHomeTeams);
router.get('/awayTeams', gameController.getAwayTeams);
router.get('/gameStats', gameController.getGamesStats);

export default router;
