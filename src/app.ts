import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', gameRoutes);
app.use('/api', teamRoutes);
app.use('/api', statusRoutes);
app.use(errorHandler);

export default app;
