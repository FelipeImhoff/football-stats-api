import { Router } from 'express';
import statusController from '../controllers/statusController';

const router = Router();

router.get('/status', statusController.getStatus);

export default router;
