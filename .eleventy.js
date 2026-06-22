module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

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
