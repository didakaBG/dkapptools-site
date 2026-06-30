module.exports = function(eleventyConfig) {
  const siteOrigin = "https://dkapptools.com";

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addGlobalData("siteOrigin", siteOrigin);
  eleventyConfig.addFilter("absoluteUrl", function(url) {
    if (!url) {
      return siteOrigin + "/";
    }

    if (/^https?:\/\//.test(url)) {
      return url;
    }

    return siteOrigin + (url.startsWith("/") ? url : "/" + url);
  });

  function sortNewestFirst(items) {
    return items.sort((a, b) => {
      return b.date - a.date;
    });
  }

  eleventyConfig.addCollection("articles", function(collectionApi) {
    return sortNewestFirst(collectionApi.getFilteredByGlob("src/articles/*.md"));
  });

  eleventyConfig.addCollection("publishedArticles", function(collectionApi) {
    return sortNewestFirst(
      collectionApi.getFilteredByGlob("src/articles/*.md").filter((item) => {
        return item.data.published !== false;
      })
    );
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
