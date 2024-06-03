import { Router } from 'express'
import {
  store,
  index,
  show,
  update,
  destroy,
  getByName
} from '../controllers/teamController.js'

const router = Router()

router.get('/teams', index)
router.post('/teams', store)
router.get('/teams/:id', show)
router.put('/teams/:id', update)
router.delete('/teams/:id', destroy)
router.get('/teams/getByName/:name', getByName)

export default router