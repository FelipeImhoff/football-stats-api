import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes';
import teamRoutes from './routes/teamRoutes';
import statusRoutes from './routes/statusRoutes';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', gameRoutes);
app.use('/api', teamRoutes);
app.use('/api', statusRoutes);
app.use(errorHandler);

export default app;
