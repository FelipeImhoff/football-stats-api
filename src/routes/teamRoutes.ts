import { Router } from 'express';
import * as teamController from '../controllers/teamController.js';

const router = Router();

router.get('/teams', teamController.index);
router.post('/teams', teamController.store);
router.get('/teams/:id', teamController.show);
router.put('/teams/:id', teamController.update);
router.delete('/teams/:id', teamController.destroy);
router.get('/teams/getByName/:name', teamController.getByName);

export default router;
