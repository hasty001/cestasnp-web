/**
 * Process promise and pass result in JSON format.
*/
const promiseAsJson = (promise, res) => {
  return promise().then(result => {
    res.json(result);

    return Promise.resolve(result);
  })
  .catch(error => {
    console.error(error);

    res.status(500).json(error && error.error ? error : { error: error.toString() });
  });
}

/**
 * Process promise and pass result in JSON format using cache.
*/
const promiseAsJsonCached = (req, key, time, promise, res) => {
  return promiseAsJson(() => {
      var result = req.app.locals.cache.get(key);
      if (result != null) {
        return Promise.resolve(result);
      }

      return promise().then(result => {
        req.app.locals.cache.put(key, result, time);

        return Promise.resolve(result);
      });
    }
    , res); 
}

module.exports = { promiseAsJson, promiseAsJsonCached };