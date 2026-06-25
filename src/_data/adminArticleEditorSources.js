const fs = require("fs");
const path = require("path");

function readFrontMatterValue(frontMatter, key) {
  const text = String(frontMatter || "");
  const pattern = new RegExp("^" + key + ":\\\\s*(.+)$", "m");
  const match = text.match(pattern);

  if (!match) {
    return "";
  }

  return match[1]
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

module.exports = function() {
  const articlesDir = path.join(process.cwd(), "src", "articles");
  const sources = {};

  if (!fs.existsSync(articlesDir)) {
    return sources;
  }

  for (const fileName of fs.readdirSync(articlesDir)) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    const filePath = path.join(articlesDir, fileName);
    const raw = fs.readFileSync(filePath, "utf8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!match || !match[1].includes("layout: article-blocks.njk") || !match[1].includes("blocks:")) {
      continue;
    }

    const frontMatter = match[1];
    const key = fileName.replace(/\.md$/, "");
    const image = readFrontMatterValue(frontMatter, "image");
    const cardImage = readFrontMatterValue(frontMatter, "cardImage") || image;

    sources[key] = {
      path: `src/articles/${fileName}`,
      frontMatter,
      title: readFrontMatterValue(frontMatter, "title"),
      description: readFrontMatterValue(frontMatter, "description"),
      category: readFrontMatterValue(frontMatter, "category"),
      relatedApp: readFrontMatterValue(frontMatter, "relatedApp"),
      readTime: readFrontMatterValue(frontMatter, "readTime") || "4 min read",
      image,
      cardImage,
      cardImageAlt: readFrontMatterValue(frontMatter, "cardImageAlt"),
      published: readFrontMatterValue(frontMatter, "published") !== "false"
    };
  }

  return sources;
};
