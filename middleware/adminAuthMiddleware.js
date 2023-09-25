const jwt = require("jsonwebtoken");
const config = require("../config");

exports.cookieJwtAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Token expired or invalid" });
  }
};


// Admin authentication middleware
// function isAdminAuthenticated(req, res, next) {
//     if (req.session.isAdmin) {
//       return next(); // User is authenticated, proceed to the next middleware or route
//     }
//     res.status(401).send('<h1>Unauthorized<h1>'); // User is not authenticated, send a 401 Unauthorized response
//   }
  
//   module.exports = (req, res, next) => {
//     const token = req.header("x-auth-token");
//     if (!token) return res.status(401).send({
//         ok: false,
//         error: "Access denied. No token provided"
//     });

//     try {
//         const decoded = jwt.verify(token, "jwtPrivateKey");
//         req.user = decoded;
//     } catch (error) {
//         return res.status(401).send({
//             ok: false,
//             error: "Token expired"
//         });
//     }

//     next();
// }
  
// module.exports = {
//   isAdminAuthenticated
// }