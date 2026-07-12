const fs = require('node:fs/promises');
const path = require('node:path');
const { parseStringPromise } = require('xml2js');
const EleventyFetch = require('@11ty/eleventy-fetch');

const url = process.env.MEDIUM_FEED || 'https://medium.com/feed/netlify';
const timeoutMs = 10_000;
const cacheDir = '.cache/medium-feed';
const fallbackPath = path.join(cacheDir, 'last-success.json');

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'post';
}

function derivePath(item) {
  const link = Array.isArray(item?.link) ? item.link[0] : item?.link;
  if (typeof link === 'string' && link.length) {
    const sections = link.split('/');
    const segment = sections[sections.length - 1].split('?')[0];
    if (segment) {
      return segment;
    }
  }

  const title = Array.isArray(item?.title) ? item.title[0] : item?.title;
  return slugify(title);
}

function normalizePosts(result) {
  const items = result?.rss?.channel?.[0]?.item ?? [];
  return items.map((item) => ({
    ...item,
    path: item.path || derivePath(item)
  }));
}

async function readFallbackPosts() {
  try {
    const file = await fs.readFile(fallbackPath, 'utf8');
    const cached = JSON.parse(file);
    return Array.isArray(cached?.posts) ? cached.posts : [];
  } catch {
    return [];
  }
}

async function writeFallbackPosts(posts) {
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(fallbackPath, JSON.stringify({ posts }), 'utf8');
}

module.exports = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const xml = await EleventyFetch(url, {
      duration: '12h',
      type: 'text',
      directory: cacheDir,
      fetchOptions: {
        signal: controller.signal
      }
    });

    const result = await parseStringPromise(xml);
    const posts = normalizePosts(result);

    await writeFallbackPosts(posts);
    return { url, posts };
  } catch (error) {
    const fallbackPosts = await readFallbackPosts();
    const reason = error?.name === 'AbortError' ? 'timed out' : (error?.message || 'unknown error');

    if (fallbackPosts.length > 0) {
      console.warn(`[medium] Feed fetch ${reason}; serving ${fallbackPosts.length} cached posts.`);
      return { url, posts: fallbackPosts };
    }

    console.warn('[medium] Feed unavailable and no cache found; continuing build with zero posts.');
    return { url, posts: [] };
  } finally {
    clearTimeout(timeout);
  }
};
