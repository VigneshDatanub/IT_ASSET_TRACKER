import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import * as userModel from '../models/userModel.js';
import xssec from '@sap/xssec';

const { createSecurityContext, XsuaaService } = xssec;

function roleFromScopes(scopes = []) {
  const names = scopes.map((scope) => String(scope).split('.').pop().toLowerCase());
  if (names.some((name) => ['administrator', 'admin'].includes(name))) return 'admin';
  if (names.some((name) => ['assetmanager', 'manager'].includes(name))) return 'asset_manager';
  return 'user';
}

async function authenticateWithXsuaa(req, next) {
  if (!config.xsuaa.clientid || !config.xsuaa.url) {
    const error = new Error('XSUAA service binding is not configured');
    error.statusCode = 503;
    return next(error);
  }

  try {
    const securityContext = await createSecurityContext(
      new XsuaaService(config.xsuaa),
      { req }
    );
    const payload = securityContext.token.payload;
    const scopes = Array.isArray(payload.scope) ? payload.scope : [];

    req.authInfo = securityContext;
    req.user = {
      id: payload.user_uuid || payload.user_id || payload.sub,
      username: payload.user_name || payload.user || payload.sub,
      email: payload.email,
      role: roleFromScopes(scopes),
      scopes
    };
    return next();
  } catch (error) {
    error.statusCode = 401;
    error.message = 'Invalid or expired XSUAA token';
    return next(error);
  }
}

async function authenticate(req, res, next) {
  if (config.authMode === 'xsuaa') {
    return authenticateWithXsuaa(req, next);
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    const error = new Error('Authentication token is required');
    error.statusCode = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await userModel.getUserById(decoded.sub);

    if (!user || !user.is_active) {
      const error = new Error('User is not active');
      error.statusCode = 401;
      return next(error);
    }

    req.user = { id: user.id, username: user.username, email: user.email, role: user.role };
    next();
  } catch (error) {
    const authError = new Error('Invalid or expired token');
    authError.statusCode = 401;
    next(authError);
  }
}

export default authenticate;
