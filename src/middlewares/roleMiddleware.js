const messages = require('../utils/messages');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: messages.auth.tokenRequired,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: messages.auth.unauthorized,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
