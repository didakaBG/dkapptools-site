const fs = require("fs");
const path = require("path");

module.exports = function() {
  const imageDir = path.join(process.cwd(), "src", "assets", "img");
  const allowed = new Set([".webp", ".png", ".jpg", ".jpeg", ".svg"]);
  const items = [];

  if (!fs.existsSync(imageDir)) {
    return items;
  }

  for (const fileName of fs.readdirSync(imageDir)) {
    const ext = path.extname(fileName).toLowerCase();

    if (!allowed.has(ext)) {
      continue;
    }

    const absolutePath = path.join(imageDir, fileName);
    const stat = fs.statSync(absolutePath);

    if (!stat.isFile()) {
      continue;
    }

    items.push({
      name: fileName,
      path: `/assets/img/${fileName}`,
      sizeBytes: stat.size
    });
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
};
