const jwt = require('jsonwebtoken');
const messages = require('../utils/messages');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: messages.auth.tokenRequired,
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: messages.auth.tokenExpired,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: messages.auth.tokenInvalid,
      });
    }

    return res.status(500).json({
      success: false,
      message: messages.auth.authFailed,
    });
  }
};

module.exports = authMiddleware;
