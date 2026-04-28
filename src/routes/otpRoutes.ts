import { Router } from 'express';
import OtpController from '../controllers/otpController';
import SendMailController from '../controllers/sendMailController';
import logger from '../utils/logger';
import { validateSpamMiddleware, validateEmail } from '../middleware';
import { getBaseUrl } from '../utils/baseUrl';
import { renderVerifySuccess, renderVerifyError } from '../views/verifyPage';

const router = Router();
const otpController = new OtpController();
const sendMailController = new SendMailController();

router.post('/otp/generate', validateEmail, validateSpamMiddleware, async (req, res) => {
  try {
    const {
      email,
      type = 'numeric',
      organization = 'Python Today',
      subject = 'Verification Code',
    } = req.body;

    const { otp, requestId, verifyToken, validityMinutes } =
      await otpController.generateOtp(email, type);

    const baseUrl = getBaseUrl(req);
    const verifyUrl = `${baseUrl}/api/otp/verify-link?token=${encodeURIComponent(verifyToken)}`;

    await sendMailController.sendMail({
      email,
      otp,
      organization,
      subject,
      validityMinutes,
      verifyUrl,
    });

    res.status(200).json({
      message: 'OTP is generated and sent to your email',
      requestId,
      validityMinutes,
    });
  } catch (error) {
    logger.error('Failed to generate OTP', (error as Error).message);
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/otp/verify', validateEmail, async (req, res) => {
  try {
    const { email, otp } = req.body;
    await otpController.verifyOtp(email, otp?.toString());

    res.status(200).json({ message: 'OTP is verified' });
  } catch (error) {
    logger.error('Failed to verify OTP', (error as Error).message);
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/otp/verify-link', async (req, res) => {
  const token = (req.query.token as string) || '';
  try {
    const { email } = await otpController.verifyByToken(token);
    res
      .status(200)
      .set('Content-Type', 'text/html; charset=utf-8')
      .send(renderVerifySuccess(email));
  } catch (error) {
    logger.error('Magic-link verify failed', (error as Error).message);
    res
      .status(400)
      .set('Content-Type', 'text/html; charset=utf-8')
      .send(renderVerifyError((error as Error).message));
  }
});

router.get('/otp/status/:requestId', async (req, res) => {
  try {
    const status = await otpController.getStatus(req.params.requestId);
    res.status(200).json(status);
  } catch (error) {
    logger.error('Failed to fetch OTP status', (error as Error).message);
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
