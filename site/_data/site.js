const fallbackSiteUrl = "https://sameerkumar.blog";

const normalizeUrl = (value) => {
  if (!value || !value.trim()) {
    return fallbackSiteUrl;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.origin;
  } catch {
    return fallbackSiteUrl;
  }
};

module.exports = {
  name: "Sameer Kumar Blog",
  description: "Articles by Sameer Kumar on backend engineering and software development.",
  author: "Sameer Kumar",
  url: normalizeUrl(process.env.URL || process.env.SITE_URL)
};
