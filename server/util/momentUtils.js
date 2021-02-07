const moment = require('moment-timezone');
const { format } = require('date-fns');

const formatAsDate = date => format(date, 'YYYY-MM-DD');

const momentDate = (date) => (date ? moment(date) : moment()).format('YYYY-MM-DD');

const momentDateTime = (dateTime) => (dateTime ? moment(dateTime) : moment()).format('YYYY-MM-DD HH:mm:ss');

module.exports = { formatAsDate, momentDate, momentDateTime };