const { parseStringPromise } = require('xml2js');

const url = process.env.MEDIUM_FEED || 'https://medium.com/feed/netlify';

module.exports = async () => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }
  const xml = await response.text();
  const result = await parseStringPromise(xml);
  result.rss.channel[0].item.forEach(element => {
    const link = element.link[0].split('/');
    element.path = link[link.length - 1].split('?')[0];
  });
  return { url, posts: result.rss.channel[0].item };
};
