import express from 'express'
import gameRoutes from './routes/gameRoutes.js'
import teamRoutes from './routes/teamRoutes.js'
import routes from './routes.js'
import cors from 'cors'

const app = express()
app.use(cors())
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/api', gameRoutes)
app.use('/api', teamRoutes)
app.use('/api', routes)

app.get('/api/status', (request, response) => {
  response.send('API está rodando normalmente')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
