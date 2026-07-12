/*
  A date formatter filter for Nunjucks
*/
module.exports = function(date) {
  const value = Array.isArray(date) ? date[0] : date;
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(d);
};
