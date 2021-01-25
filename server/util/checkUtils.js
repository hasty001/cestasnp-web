const sanitize = require('mongo-sanitize');
const {admin} = require('./firebase');
const promiseAsJson = require('./promiseUtils');
const auth = admin.auth();

/**
 * Checks if param is set, otherwise returns false and sets res to error
 */
const checkValid = (value, res) => {
  if (!value) {
    res.status(500).json({ error: 'Data is not valid.' });

    return false;
  }

  return true;
}

/**
 * Checks if token in request header corresponds to passed uid. 
 * Then checks check and calls promise callback with result as json.
 */
const checkToken = (req, res, uid, promise, check = () => true) => {
  try {
    const token = req.header("X-Auth-Token");

    if (!token || token.length == 0) {
      res.status(401).json({ error: 'Authorization token is missing.' });
    } else {
      auth.verifyIdToken(token).then(decodedToken => {
        if (!decodedToken || decodedToken.uid !== uid) {
          res.status(403).json({ error: 'You are not authorized to perform this operation.' });
        } else {
          if (checkValid(check(), res)) {
            promiseAsJson(promise, res);
          }
        }
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error.toString() });
  }
}

const sanitizeUserId = (userId) => {
  if (userId && userId.length <= 3) {
    // for older users
    return sanitize(parseInt(userId));
  }

  return sanitize(userId)
}

module.exports = { checkToken, checkValid, sanitizeUserId };