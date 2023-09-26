const logger = require('./logger');

// Error handling middleware
function errorHandler(err, req, res, next) {
  logger.error(`Error: ${err.message}`);
  res.status(500).send('Something went wrong.');
}

module.exports = {
  errorHandler,
};
