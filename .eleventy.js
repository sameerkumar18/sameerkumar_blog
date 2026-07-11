module.exports = function(eleventyConfig) {

  eleventyConfig.addFilter("date", require("./filters/dates.js") );

  return {
    dir: {
      input: "site",
      output: "dist",
      data: "_data"
    }
  };

};
