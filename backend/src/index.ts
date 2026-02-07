import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import authRouter from '@/routes/auth';
import usersRouter from '@/routes/users';
import appointmentsRouter from '@/routes/appointments';
import prescriptionsRouter from '@/routes/prescriptions';
import clinicsRouter from '@/routes/clinics';
import paymentsRouter from '@/routes/payments';
import statsRouter from '@/routes/stats';
import notificationsRouter from '@/routes/notifications';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/clinics', clinicsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/notifications', notificationsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(env.port, () => {
  console.log(`Backend listening on port ${env.port}`);
});
