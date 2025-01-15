const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
};

module.exports = { requestLogger };
