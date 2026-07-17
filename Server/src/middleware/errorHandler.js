function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.code === '23505' ? 409 : 500);
  const response = {
    success: false,
    message: err.code === '23505' ? 'Username or email address already exists' : (err.message || 'Internal Server Error')
  };

  if (process.env.NODE_ENV !== 'production') {
    response.error = err.stack;
  }

  res.status(statusCode).json(response);
}

export { errorHandler, notFoundHandler };
