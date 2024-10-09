import { Router } from 'express';
import * as teamController from '../controllers/teamController.js';

const router = Router();

router.get('/', teamController.index); //Done and Tested
router.post('/', teamController.store); //Done and Tested
router.get('/:id', teamController.show); //Done and Tested
router.put('/:id', teamController.update); //Done and Tested
router.delete('/:id', teamController.destroy); //Done and Tested
router.get('/name/:name', teamController.getByName); //Done and Tested

export default router;
