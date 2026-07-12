/*
  Exposes the current year to templates (e.g. footer copyright line).
*/
module.exports = function() {
  return new Date().getFullYear();
};
