import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import disasterRoutes from './routes/disasterRoutes';
import requestRoutes from './routes/requestRoutes';
import allocationRoutes from './routes/allocationRoutes';
import searchRoutes from './routes/searchRoutes';
import publicRoutes from './routes/publicRoutes';
import {
  resourceRouter, inventoryRouter, hospitalRouter, shelterRouter,
  teamRouter, vehicleRouter, shortageRouter, simulationRouter,
  analyticsRouter, auditRouter, volunteerRouter, supplierRouter,
} from './routes/miscRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initSocket } from './socket';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'urbanresq-backend', time: new Date().toISOString() }));

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/emergency-requests', requestRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/resources', resourceRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/hospitals', hospitalRouter);
app.use('/api/shelters', shelterRouter);
app.use('/api/rescue-teams', teamRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/shortages', shortageRouter);
app.use('/api/volunteers', volunteerRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/simulations', simulationRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/audit-logs', auditRouter);
app.use('/api/search', searchRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;
const server = http.createServer(app);

if (process.env.NODE_ENV !== 'test') {
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`UrbanResQ backend listening on port ${PORT}`);
  });
}

export default app;
