import express from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import authenticate from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import validate from '../middleware/validateMiddleware.js';
import config from '../config/env.js';

const router = express.Router();

function localAuthOnly(req, res, next) {
  const hasXsuaaBinding = Boolean(config.xsuaa?.clientid || config.xsuaa?.url);
  if (config.authMode === 'xsuaa' && hasXsuaaBinding) {
    return res.status(410).json({ success: false, message: 'Use XSUAA login through the application router' });
  }
  next();
}

router.post(
  '/login',
  [
    body('username').isString().trim().notEmpty(),
    body('password').isString().notEmpty()
  ],
  validate,
  localAuthOnly,
  login
);

router.post(
  '/register',
  [
    body('username').isString().trim().notEmpty(),
    body('email').isEmail(),
    body('password').isString().isLength({ min: 8 })
  ],
  validate,
  localAuthOnly,
  register
);

router.get('/me', authenticate, getMe);

export default router;
