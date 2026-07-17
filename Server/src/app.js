import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/assets', assetRoutes);
app.use('/categories', categoryRoutes);
app.use('/maintenance', maintenanceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'IT Asset Tracker API is running' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
