import { Router } from 'express';
import * as teamController from '../controllers/teamController.js';

const router = Router();

router.get('/', teamController.index);
router.post('/', teamController.store);
router.get('/:id', teamController.show);
router.put('/:id', teamController.update);
router.delete('/:id', teamController.destroy);
router.get('/name/:name', teamController.getByName);

export default router;
