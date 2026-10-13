import jwt from 'jsonwebtoken';

/**
 * Authentication middleware for verifying JWT from HttpOnly cookie or Authorization header.
 */
export const requireAuth = (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback to Bearer token in header if cookie is absent
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_career_mentor');
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.',
    });
  }
};

export const optionalAuth = (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback to Bearer token in header if cookie is absent
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_career_mentor');
      req.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
      };
    } catch {
      // Ignore invalid or expired token for optional auth
    }
  }

  next();
};

export default requireAuth;
