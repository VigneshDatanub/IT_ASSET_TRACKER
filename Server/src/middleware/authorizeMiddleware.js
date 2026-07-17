import { hasPermission } from '../utils/permissions.js';

function authorize(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
    }

    if (!hasPermission(req.user.role, requiredPermission)) {
      const error = new Error('Forbidden');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
}

export default authorize;
