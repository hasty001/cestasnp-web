/** 
  * Logs to console only in development mode.
  */
function logDev(message) {

  if (process.env.NODE_ENV !== 'production') {
    if (arguments.length == 1) {
      console.log(message); 
    } else { 
      console.log(message, ...([...arguments].slice(1))); 
    }
  }
}

export { logDev };