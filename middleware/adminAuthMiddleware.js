// Admin authentication middleware
function isAdminAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
      return next(); // User is authenticated, proceed to the next middleware or route
    }
    res.status(401).send('<h1>Unauthorized<h1>'); // User is not authenticated, send a 401 Unauthorized response
  }
  
  module.exports = {
    isAdminAuthenticated,
  };
  