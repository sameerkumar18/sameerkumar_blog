const fs = require('node:fs/promises');
const path = require('node:path');
const { parseStringPromise } = require('xml2js');
const EleventyFetch = require('@11ty/eleventy-fetch');

const url = process.env.MEDIUM_FEED || 'https://medium.com/feed/netlify';
const timeoutMs = Number.parseInt(process.env.FEED_TIMEOUT_MS || '10000', 10);
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
  const timeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 10_000;
  let timeoutHandle;

  try {
    const xml = await Promise.race([
      EleventyFetch(url, {
        duration: '12h',
        type: 'text',
        directory: cacheDir,
        fetchOptions: {
          signal: controller.signal
        }
      }),
      new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          controller.abort();
          reject(new Error(`Feed request timed out after ${timeout}ms`));
        }, timeout);
      })
    ]);

    const result = await parseStringPromise(xml);
    const posts = normalizePosts(result);

    await writeFallbackPosts(posts);
    return { url, posts };
  } catch (error) {
    const fallbackPosts = await readFallbackPosts();
    const reason = `${error?.name || 'Error'}: ${error?.message || 'No message provided'}`;

    if (fallbackPosts.length > 0) {
      console.warn(`[medium] Feed fetch failed (${reason}); serving ${fallbackPosts.length} cached posts.`);
      return { url, posts: fallbackPosts };
    }

    console.warn(`[medium] Feed unavailable (${reason}) and no cache found; continuing build with zero posts.`);
    return { url, posts: [] };
  } finally {
    clearTimeout(timeoutHandle);
  }
};
