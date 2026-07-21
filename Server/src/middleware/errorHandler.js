function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === '23505') {
    statusCode = 409;
    const constraint = String(err.constraint || '').toLowerCase();
    const detail = String(err.detail || '').toLowerCase();

    if (constraint.includes('username') || detail.includes('username')) {
      message = 'Username already exists';
    } else if (constraint.includes('email') || detail.includes('email')) {
      message = 'Email address is already registered';
    } else if (constraint.includes('asset_id') || detail.includes('asset_id')) {
      message = 'Asset ID already exists';
    } else if (constraint.includes('categories') || constraint.includes('category') || detail.includes('category')) {
      message = 'Category name already exists';
    } else {
      message = 'A record with this identifier already exists';
    }
  }

  const response = {
    success: false,
    message
  };

  if (process.env.NODE_ENV !== 'production') {
    response.error = err.stack;
  }

  res.status(statusCode).json(response);
}

export { errorHandler, notFoundHandler };
