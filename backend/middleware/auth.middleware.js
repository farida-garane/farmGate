const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Authentification requise');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ex: { id, phone, role }
    next();
  } catch (err) {
    const error = new Error('Token invalide ou expiré');
    error.statusCode = 401;
    next(error);
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Authentification requise');
      error.statusCode = 401;
      return next(error);
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      const error = new Error('Accès refusé : privilèges insuffisants');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
}

authMiddleware.authMiddleware = authMiddleware;
authMiddleware.authorizeRoles = authorizeRoles;

module.exports = authMiddleware;