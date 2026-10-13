/**
 * Centralized Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'An unexpected internal server error occurred.';

  // Provide friendly guidance for database connectivity issues
  if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connect ECONNREFUSED')) {
    statusCode = 503;
    message = 'PostgreSQL database is currently disconnected. Please start your local PostgreSQL instance or configure your cloud database URL (Neon / Supabase) in server/.env.';
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      code: err.code,
      details: err.details,
    }),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${req.method} ${req.url} ->`, err.message);
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
