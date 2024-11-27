import { Router } from 'express';
import * as gameController from '../controllers/gameController.js';

const router = Router();

router.get('/teamGames/:id', gameController.getTeamGames);
router.get('/teamGames/:id/season/:season', gameController.getTeamGamesBySeason);
router.get('/homeManagers', gameController.getHomeManagers);
router.get('/awayManagers', gameController.getAwayManagers);
router.post('/sync', gameController.sync)

// Trocar para time essa rota como /team/stats
router.get('/gameStats', gameController.getGamesStats);

export default router;
