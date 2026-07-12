function htmlToText(value) {
  return String(value || '')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter('date', require('./filters/dates.js'));

  eleventyConfig.addFilter('isoDate', function(value) {
    const parsedValue = Array.isArray(value) ? value[0] : value;
    const date = new Date(parsedValue);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString();
  });

  eleventyConfig.addFilter('rfc822Date', function(value) {
    const parsedValue = Array.isArray(value) ? value[0] : value;
    const date = new Date(parsedValue);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toUTCString();
  });

  eleventyConfig.addFilter('json', function(value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addFilter('seoDescription', function(value, maxLength = 160) {
    const text = htmlToText(value);
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength).trimEnd()}…`;
  });

  eleventyConfig.addFilter('readingTime', function(value, wordsPerMinute = 200) {
    const text = htmlToText(value);
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
  });

  eleventyConfig.addFilter('hardenPostImages', function(value) {
    if (!value) {
      return '';
    }

    return String(value).replace(/<img\b([^>]*)>/gi, (match, attrs) => {
      let updatedAttrs = attrs;
      if (!/\sloading\s*=\s*/i.test(updatedAttrs)) {
        updatedAttrs += ' loading="lazy"';
      }
      if (!/\sdecoding\s*=\s*/i.test(updatedAttrs)) {
        updatedAttrs += ' decoding="async"';
      }
      return `<img${updatedAttrs}>`;
    });
  });

  return {
    dir: {
      input: 'site',
      output: 'dist',
      data: '_data'
    }
  };
};
