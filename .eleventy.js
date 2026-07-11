module.exports = function(eleventyConfig) {

  eleventyConfig.addFilter("date", require("./filters/dates.js") );
  eleventyConfig.addFilter("isoDate", function(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString();
  });
  eleventyConfig.addFilter("rfc822Date", function(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toUTCString();
  });
  eleventyConfig.addFilter("json", function(value) {
    return JSON.stringify(value);
  });

  return {
    dir: {
      input: "site",
      output: "dist",
      data: "_data"
    }
  };

};
