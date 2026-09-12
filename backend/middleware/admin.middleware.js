const sendResponse = require('../utils/sendResponse');

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendResponse(res, 403, false, 'Access denied. Admin privileges required.');
  }
  next();
};

module.exports = adminMiddleware;
