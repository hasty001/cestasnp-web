const sortByDateDesc = (array, date = 'date') => {
  return array.sort(function(a, b) {
    return b[date] > a[date] ? 1 : b[date] < a[date] ? -1 : 0;
  });
};

const sortByDateAsc = (array, date = 'date') => {
  return array.sort(function(a, b) {
    return a[date] > b[date] ? 1 : a[date] < b[date] ? -1 : 0;
  });
};

export { sortByDateDesc, sortByDateAsc };
