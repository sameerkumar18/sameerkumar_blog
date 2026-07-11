const fallbackSiteUrl = "https://example.com";

const normalizeUrl = (value) => {
  if (!value) {
    return fallbackSiteUrl;
  }

  return value.trim().replace(/\/+$/, "");
};

module.exports = {
  name: "Sameer Kumar Blog",
  description: "Articles by Sameer Kumar on backend engineering and software development.",
  author: "Sameer Kumar",
  url: normalizeUrl(process.env.URL || process.env.SITE_URL)
};
