import { Router } from 'express';
import * as gameController from '../controllers/gameController.js';

const router = Router();

router.get('/teamGames/:id', gameController.getTeamGames); //DONE and TESTED
router.get('/teamGames/:id/season/:season', gameController.getTeamGamesBySeason); //DONE and TESTED
router.get('/homeManagers', gameController.getHomeManagers); //DONE and TESTED
router.get('/awayManagers', gameController.getAwayManagers); //DONE and TESTED
router.get('/teams', gameController.getTeams); //DONE and TESTED
router.get('/gameStats', gameController.getGamesStats); //TESTED

export default router;
