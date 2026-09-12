const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const sendResponse = require('../utils/sendResponse');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, false, 'Authentication required. Please log in.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return sendResponse(res, 401, false, 'User not found. Please log in again.');
    }

    if (!user.isActive) {
      return sendResponse(res, 403, false, 'Your account has been suspended. Contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendResponse(res, 401, false, 'Invalid token. Please log in again.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendResponse(res, 401, false, 'Token expired. Please log in again.');
    }
    next(error);
  }
};

module.exports = authMiddleware;
