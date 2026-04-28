import express, { Express } from 'express';
import cors from 'cors';
import otpRoutes from './routes/otpRoutes';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.set('trust proxy', true);
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      message: 'Welcome to OTP service',
      endpoints: {
        generate: 'POST /api/otp/generate',
        verifyByCode: 'POST /api/otp/verify',
        verifyByLink: 'GET /api/otp/verify-link?token=...',
        status: 'GET /api/otp/status/:requestId',
      },
    });
  });

  app.use('/api', otpRoutes);

  return app;
}

export default createApp();
