/** 
  * Logs to console only in development mode.
  */
const logDev = (message = undefined, params = undefined) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, params);
  }
}

export { logDev };