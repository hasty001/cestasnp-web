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

    res.status(500).json({ error: error.toString() });
  });
}

module.exports = promiseAsJson;