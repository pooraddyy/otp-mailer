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
      service: 'otp-mailer',
      message: 'Two ways to verify an email: send a code, or send a magic-link button.',
      endpoints: {
        sendCode: 'POST /api/otp/generate     -> emails the OTP code only',
        sendLink: 'POST /api/otp/send-link    -> emails the verify button only',
        verifyByCode: 'POST /api/otp/verify',
        verifyByLink: 'GET  /api/otp/verify-link?token=...',
        status: 'GET  /api/otp/status/:requestId',
      },
    });
  });

  app.use('/api', otpRoutes);

  return app;
}

export default createApp();
