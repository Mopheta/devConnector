const jwt = require('jsonwebtoken');
const config = require('config');

//Middleware es una funcion que tiene acceso al request, response objects,
//next es un callback, que se corre cuando termina todo para moverse al otro middleware
module.exports = function (req, res, next) {
  //Get token from header
  const token = req.header('x-auth-token'); //header key

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  //Verify token

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user; //user viene en el payload
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
