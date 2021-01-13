const {admin} = require('./firebase');
const auth = admin.auth();

/**
 * Checks if param is set, otherwise returns false and sets res to error
 */
const checkNotEmpty = (value, res) => {
  if (!value) {
    res.status(500).json({ error: 'Data is not valid.' });

    return false;
  }

  return true;
}

const checkToken = (req, res, uid, callback) => {
  const token = req.header("X-Auth-Token");

  if (!token || token.length == 0) {
    res.status(401).json({ error: 'Authorization token is missing.' });
  } else {
    auth.verifyIdToken(token).then(decodedToken => {
      if (!decodedToken || decodedToken.uid !== uid) {
        res.status(403).json({ error: 'You are not authorized to perform this operation.' });
      } else {
        callback();
      }
    });
  }
}

module.exports = { checkToken, checkNotEmpty };