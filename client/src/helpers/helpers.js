import * as Constants from '../components/Constants';
import format from 'date-fns/format';

const sortByDateDesc = (array, date = 'date') => {
  return array.sort((a, b) => {
    return b[date] > a[date] ? 1 : b[date] < a[date] ? -1 : 0;
  });
};

const sortByDateAsc = (array, date = 'date') => {
  return array.sort((a, b) => {
    return a[date] > b[date] ? 1 : a[date] < b[date] ? -1 : 0;
  });
};

const dateToStrFormat = (date, strFormat, def = "") => 
{
  var startDateText = def;

  if (date && date !== "")
  try 
  {
    startDateText = format(date, strFormat, {locale: "sk-SK"})
  } 
  catch(err) 
  { 
    console.error(err);
    startDateText = def;
  }

  return startDateText;
}

const dateTimeToStr = (date, def = "") => dateToStrFormat(date, Constants.DateTimeViewFormat, def);
const dateToStr = (date, def = "") => dateToStrFormat(date, Constants.DateViewFormat, def);

export { sortByDateDesc, sortByDateAsc, dateToStr, dateTimeToStr };
