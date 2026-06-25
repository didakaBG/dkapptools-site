(() => {
  const PREVIEW_STORAGE_KEY = "dkArticlePreviewDraft";
  const LOCAL_DRAFT_STORAGE_KEY = "dkArticleLocalDraft";

  const sourceElements = document.querySelectorAll("[data-admin-article-source]");
  const mediaLibraryElement = document.querySelector("[data-admin-media-library]");

  const sources = {};
  let mediaLibrary = [];

  try {
    mediaLibrary = JSON.parse(mediaLibraryElement ? mediaLibraryElement.textContent || "[]" : "[]");
  } catch {
    mediaLibrary = [];
  }

  sourceElements.forEach((element) => {
    try {
      const item = JSON.parse(element.textContent || "{}");

      if (item && item.key) {
        sources[item.key] = normalizeArticleSource(item);
      }
    } catch {
      // Ignore invalid embedded article data.
    }
  });

  const dom = {
    editor: document.querySelector("[data-article-editor]"),
    blockList: document.querySelector("[data-article-block-list]"),
    status: document.querySelector("[data-article-status]"),
    saveNotice: document.querySelector("[data-article-save-notice]"),
    topStatus: document.querySelector("[data-article-top-status]"),
    publicLink: document.querySelector("[data-article-public-link]"),
    previewButton: document.querySelector("[data-article-preview-open]"),
    saveButton: document.querySelector("[data-article-save]"),
    newArticleButton: document.querySelector("[data-article-new]"),
    newArticleModal: document.querySelector("[data-new-article-modal]"),
    newArticleTitle: document.querySelector("[data-new-article-title]"),
    newArticleAlias: document.querySelector("[data-new-article-alias]"),
    newArticleCreate: document.querySelector("[data-new-article-create]"),
    mediaPicker: document.querySelector("[data-media-picker]"),
    mediaPickerGrid: document.querySelector("[data-media-picker-grid]")
  };

  const fields = {
    title: document.querySelector("[data-article-field='title']"),
    alias: document.querySelector("[data-article-field='alias']"),
    description: document.querySelector("[data-article-field='description']"),
    category: document.querySelector("[data-article-field='category']"),
    relatedApp: document.querySelector("[data-article-field='relatedApp']"),
    readTime: document.querySelector("[data-article-field='readTime']"),
    image: document.querySelector("[data-article-field='image']"),
    cardImage: document.querySelector("[data-article-field='cardImage']"),
    cardImageAlt: document.querySelector("[data-article-field='cardImageAlt']"),
    published: document.querySelector("[data-article-field='published']")
  };

  const state = {
    current: null,
    activeBlockIndex: null,
    activeMediaSelect: null,
    saveNoticeTimer: null
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value || []));
  }

  function text(value) {
    return String(value || "");
  }

  function escapeHtml(value) {
    return text(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function yamlQuote(value) {
    return `"${text(value)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()}"`;
  }

  function multilineYaml(key, value, spaces) {
    const pad = " ".repeat(spaces);
    const childPad = " ".repeat(spaces + 2);
    const body = text(value)
      .split(/\r?\n/)
      .map((line) => `${childPad}${line}`)
      .join("\n");

    return `${pad}${key}: >-\n${body || childPad}`;
  }

  function isLocalAdminMode() {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  }

  function isLiveAdminHost() {
    return window.location.hostname === "admin.dkapptools.com";
  }

  function showSaveNotice(message, mode = "info") {
    if (!dom.saveNotice) {
      return;
    }

    dom.saveNotice.hidden = false;
    dom.saveNotice.textContent = message;
    dom.saveNotice.dataset.mode = mode;

    window.clearTimeout(state.saveNoticeTimer);
    state.saveNoticeTimer = window.setTimeout(() => {
      dom.saveNotice.hidden = true;
    }, 6500);
  }

  function setStatus(message, mode = "info") {
    if (dom.status) {
      dom.status.textContent = message;
    }

    if (dom.topStatus) {
      dom.topStatus.textContent = message;
      dom.topStatus.dataset.mode = mode;
    }

    showSaveNotice(message, mode);
  }

  function fieldValue(name, fallback = "") {
    const field = fields[name];
    return field ? field.value : fallback;
  }

  function setFieldValue(name, value) {
    const field = fields[name];

    if (field) {
      field.value = value || "";
    }
  }

  function setFieldBoolean(name, value) {
    const field = fields[name];

    if (field) {
      field.value = value ? "true" : "false";
    }
  }

  function readFrontMatterValue(frontMatter, key) {
    const pattern = new RegExp("^" + key + ":\\s*(.+)$", "m");
    const match = text(frontMatter).match(pattern);

    if (!match) {
      return "";
    }

    return match[1].trim().replace(/^['"]|['"]$/g, "");
  }

  function normalizeBlock(block) {
    if (!block || !block.type) {
      return null;
    }

    if (block.type === "paragraph") {
      return { type: "paragraph", text: text(block.text) };
    }

    if (block.type === "heading") {
      return { type: "heading", id: text(block.id), text: text(block.text) };
    }

    if (block.type === "note") {
      return {
        type: "note",
        heading: text(block.heading || block.title),
        text: text(block.text)
      };
    }

    if (block.type === "cardGrid") {
      const cards = Array.isArray(block.cards) ? block.cards : [];

      return {
        type: "cardGrid",
        cards: cards.length
          ? cards.map((card) => ({
              title: text(card && card.title),
              text: text(card && card.text)
            }))
          : [
              { title: "", text: "" },
              { title: "", text: "" }
            ]
      };
    }

    if (block.type === "list") {
      return {
        type: "list",
        items: Array.isArray(block.items) ? block.items.map(text) : []
      };
    }

    if (block.type === "image") {
      return {
        type: "image",
        src: text(block.src),
        localPreviewSrc: text(block.localPreviewSrc),
        alt: text(block.alt),
        caption: text(block.caption),
        size: block.size === "small" || block.size === "wide" ? block.size : "standard"
      };
    }

    return clone(block);
  }

  function normalizeBlocks(blocks) {
    const normalized = Array.isArray(blocks)
      ? blocks.map(normalizeBlock).filter(Boolean)
      : [];

    return normalized.length ? normalized : [{ type: "paragraph", text: "" }];
  }

  function normalizeArticleSource(source) {
    const image = source.image || readFrontMatterValue(source.frontMatter, "image");
    const cardImage = source.cardImage || readFrontMatterValue(source.frontMatter, "cardImage") || image;

    return {
      ...source,
      path: source.path || `src/articles/${source.key}.md`,
      title: source.title || readFrontMatterValue(source.frontMatter, "title"),
      description: source.description || readFrontMatterValue(source.frontMatter, "description"),
      category: source.category || readFrontMatterValue(source.frontMatter, "category"),
      relatedApp: source.relatedApp || readFrontMatterValue(source.frontMatter, "relatedApp"),
      readTime: source.readTime || readFrontMatterValue(source.frontMatter, "readTime") || "4 min read",
      image,
      cardImage,
      cardImageAlt: source.cardImageAlt || readFrontMatterValue(source.frontMatter, "cardImageAlt"),
      published: source.published !== false && readFrontMatterValue(source.frontMatter, "published") !== "false",
      blocks: normalizeBlocks(source.blocks)
    };
  }

  function defaultBlock(type) {
    if (type === "heading") {
      return { type: "heading", id: "", text: "" };
    }

    if (type === "note") {
      return { type: "note", heading: "", text: "" };
    }

    if (type === "cardGrid") {
      return {
        type: "cardGrid",
        cards: [
          { title: "", text: "" },
          { title: "", text: "" }
        ]
      };
    }

    if (type === "list") {
      return { type: "list", items: [""] };
    }

    if (type === "image") {
      return { type: "image", src: "", localPreviewSrc: "", alt: "", caption: "", size: "standard" };
    }

    return { type: "paragraph", text: "" };
  }

  function blockLabel(type) {
    return {
      paragraph: "Параграф",
      heading: "Подзаглавие",
      note: "Голям акцент",
      cardGrid: "Две карти",
      list: "Списък",
      image: "Снимка"
    }[type] || "Блок";
  }

  function isMeaningfulText(value) {
    return text(value).trim().length > 0;
  }

  function cleanBlock(block, options = {}) {
    const includeLocalPreview = options.includeLocalPreview === true;
    const normalized = normalizeBlock(block);

    if (!normalized) {
      return null;
    }

    if (normalized.type === "paragraph") {
      return isMeaningfulText(normalized.text) ? normalized : null;
    }

    if (normalized.type === "heading") {
      return isMeaningfulText(normalized.text) ? normalized : null;
    }

    if (normalized.type === "note") {
      return isMeaningfulText(normalized.heading) || isMeaningfulText(normalized.text) ? normalized : null;
    }

    if (normalized.type === "cardGrid") {
      normalized.cards = normalized.cards.filter((card) => isMeaningfulText(card.title) || isMeaningfulText(card.text));
      return normalized.cards.length ? normalized : null;
    }

    if (normalized.type === "list") {
      normalized.items = normalized.items.filter(isMeaningfulText);
      return normalized.items.length ? normalized : null;
    }

    if (normalized.type === "image") {
      if (!isMeaningfulText(normalized.src) && !(includeLocalPreview && isMeaningfulText(normalized.localPreviewSrc))) {
        return null;
      }

      if (!includeLocalPreview) {
        delete normalized.localPreviewSrc;
      }

      normalized.size = normalized.size === "small" || normalized.size === "wide" ? normalized.size : "standard";
      return normalized;
    }

    return normalized;
  }

  function cleanBlocks(blocks, options = {}) {
    return (blocks || []).map((block) => cleanBlock(block, options)).filter(Boolean);
  }

  function cleanFrontMatter(frontMatter) {
    const raw = text(frontMatter).trim();
    const withoutBlocks = raw.includes("\nblocks:")
      ? raw.slice(0, raw.indexOf("\nblocks:"))
      : raw;

    return withoutBlocks.trimEnd();
  }

  function upsertLine(frontMatter, key, value) {
    const nextLine = `${key}: ${yamlQuote(value)}`;
    const lines = text(frontMatter).split(/\r?\n/).filter((line) => line.trim().length > 0);
    let updated = false;

    const nextLines = lines.map((line) => {
      if (line.match(new RegExp(`^${key}:`))) {
        updated = true;
        return nextLine;
      }

      return line;
    });

    if (!updated) {
      nextLines.push(nextLine);
    }

    return nextLines.join("\n");
  }

  function upsertBooleanLine(frontMatter, key, value) {
    const nextLine = `${key}: ${value ? "true" : "false"}`;
    const lines = text(frontMatter).split(/\r?\n/).filter((line) => line.trim().length > 0);
    let updated = false;

    const nextLines = lines.map((line) => {
      if (line.match(new RegExp(`^${key}:`))) {
        updated = true;
        return nextLine;
      }

      return line;
    });

    if (!updated) {
      nextLines.push(nextLine);
    }

    return nextLines.join("\n");
  }

  function ensureBaseFrontMatter(frontMatter) {
    const lines = cleanFrontMatter(frontMatter)
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean);

    if (!lines.some((line) => line === "layout: article-blocks.njk")) {
      lines.unshift("layout: article-blocks.njk");
    }

    return lines.join("\n");
  }

  function serializeBlocks(blocks) {
    const output = ["blocks:"];
    const serializableBlocks = cleanBlocks(blocks, { includeLocalPreview: false });

    serializableBlocks.forEach((block) => {
      output.push(`  - type: ${block.type}`);

      if (block.type === "paragraph") {
        output.push(multilineYaml("text", block.text, 4));
      }

      if (block.type === "heading") {
        if (block.id) {
          output.push(`    id: ${yamlQuote(block.id)}`);
        }

        output.push(`    text: ${yamlQuote(block.text)}`);
      }

      if (block.type === "note") {
        output.push(`    heading: ${yamlQuote(block.heading)}`);
        output.push(multilineYaml("text", block.text, 4));
      }

      if (block.type === "cardGrid") {
        output.push("    cards:");
        block.cards.forEach((card) => {
          output.push(`      - title: ${yamlQuote(card.title)}`);
          output.push(multilineYaml("text", card.text, 8));
        });
      }

      if (block.type === "list") {
        output.push("    items:");
        block.items.forEach((item) => {
          output.push(`      - ${yamlQuote(item)}`);
        });
      }

      if (block.type === "image") {
        output.push(`    src: ${yamlQuote(block.src)}`);
        output.push(`    alt: ${yamlQuote(block.alt)}`);

        if (block.caption) {
          output.push(`    caption: ${yamlQuote(block.caption)}`);
        }

        if (block.size && block.size !== "standard") {
          output.push(`    size: ${yamlQuote(block.size)}`);
        }
      }

      output.push("");
    });

    return output.join("\n").trimEnd();
  }

  function buildArticleContent() {
    if (!state.current) {
      return "";
    }

    let frontMatter = ensureBaseFrontMatter(state.current.frontMatter);
    frontMatter = upsertLine(frontMatter, "title", fieldValue("title", state.current.title));
    frontMatter = upsertLine(frontMatter, "description", fieldValue("description", state.current.description));
    frontMatter = upsertLine(frontMatter, "category", fieldValue("category", state.current.category));
    frontMatter = upsertLine(frontMatter, "relatedApp", fieldValue("relatedApp", state.current.relatedApp));
    frontMatter = upsertLine(frontMatter, "readTime", fieldValue("readTime", state.current.readTime || "3 min read"));
    frontMatter = upsertLine(frontMatter, "image", fieldValue("image", state.current.image));
    frontMatter = upsertLine(frontMatter, "cardImage", fieldValue("cardImage", state.current.cardImage));
    frontMatter = upsertLine(frontMatter, "cardImageAlt", fieldValue("cardImageAlt", state.current.cardImageAlt));
    frontMatter = upsertBooleanLine(frontMatter, "published", fieldValue("published", "true") === "true");

    return `---\n${frontMatter}\n${serializeBlocks(state.current.blocks)}\n---\n`;
  }

  function buildDraft() {
    if (!state.current) {
      return null;
    }

    return {
      key: state.current.key,
      path: state.current.path,
      title: fieldValue("title", state.current.title),
      description: fieldValue("description", state.current.description),
      category: fieldValue("category", state.current.category),
      relatedApp: fieldValue("relatedApp", state.current.relatedApp),
      readTime: fieldValue("readTime", state.current.readTime || "3 min read"),
      image: fieldValue("image", state.current.image),
      cardImage: fieldValue("cardImage", state.current.cardImage),
      cardImageAlt: fieldValue("cardImageAlt", state.current.cardImageAlt),
      published: fieldValue("published", "true") === "true",
      blocks: cleanBlocks(state.current.blocks, { includeLocalPreview: true })
    };
  }

  function writePreviewDraft() {
    const draft = buildDraft();

    if (!draft) {
      return null;
    }

    localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(draft));
    return draft;
  }

  function openPreview() {
    if (!state.current) {
      setStatus("Първо избери или създай статия.", "warning");
      return;
    }

    writePreviewDraft();
    window.open("/_admin/article-preview/", "_blank", "noopener");
  }

  function setArticle(source) {
    state.current = normalizeArticleSource(source);
    state.activeBlockIndex = state.current.blocks.length ? 0 : null;

    setFieldValue("title", state.current.title);
    setFieldValue("alias", state.current.key);
    setFieldValue("description", state.current.description);
    setFieldValue("category", state.current.category);
    setFieldValue("relatedApp", state.current.relatedApp);
    setFieldValue("readTime", state.current.readTime || "3 min read");
    setFieldValue("image", state.current.image);
    setFieldValue("cardImage", state.current.cardImage);
    setFieldValue("cardImageAlt", state.current.cardImageAlt);
    setFieldBoolean("published", state.current.published);

    if (dom.publicLink) {
      dom.publicLink.href = state.current.url || `https://dkapptools.com/articles/${state.current.key}/`;
    }

    if (dom.editor) {
      dom.editor.hidden = false;
      dom.editor.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    refreshStaticMediaControls();
    renderEditor();
  }

  function openEditor(key) {
    const source = sources[key];

    if (!source) {
      setStatus("Статията не може да бъде заредена.", "error");
      return;
    }

    setArticle(source);
    setStatus("Редактираш избраната статия.", "info");

    if (fields.title) {
      fields.title.focus();
    }
  }

  function updateBlock(index, key, value, cardIndex = null) {
    if (!state.current || !state.current.blocks[index]) {
      return;
    }

    const block = state.current.blocks[index];

    if (cardIndex !== null) {
      if (!Array.isArray(block.cards)) {
        block.cards = [];
      }

      if (!block.cards[cardIndex]) {
        block.cards[cardIndex] = { title: "", text: "" };
      }

      block.cards[cardIndex][key] = value;
      return;
    }

    block[key] = value;
  }

  function moveBlock(index, direction) {
    if (!state.current) {
      return;
    }

    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= state.current.blocks.length) {
      return;
    }

    const [block] = state.current.blocks.splice(index, 1);
    state.current.blocks.splice(nextIndex, 0, block);
    state.activeBlockIndex = nextIndex;
    renderEditor(nextIndex);
  }

  function removeBlock(index) {
    if (!state.current) {
      return;
    }

    state.current.blocks.splice(index, 1);
    state.activeBlockIndex = Math.min(index, state.current.blocks.length - 1);

    if (state.current.blocks.length === 0) {
      state.current.blocks.push(defaultBlock("paragraph"));
      state.activeBlockIndex = 0;
    }

    renderEditor(state.activeBlockIndex);
  }

  function createButton(textContent, onClick, className = "button secondary") {
    const button = document.createElement("button");
    button.className = className;
    button.type = "button";
    button.textContent = textContent;
    button.addEventListener("click", onClick);
    return button;
  }

  function editableText(tagName, className, value, onInput, placeholder = "") {
    const node = document.createElement(tagName);
    node.className = className;
    node.contentEditable = "true";
    node.spellcheck = true;
    node.dataset.placeholder = placeholder;
    node.textContent = value || "";

    node.addEventListener("input", () => {
      onInput(node.textContent.trim());
    });

    node.addEventListener("paste", (event) => {
      event.preventDefault();
      const pastedText = event.clipboardData ? event.clipboardData.getData("text/plain") : "";
      document.execCommand("insertText", false, pastedText);
    });

    node.addEventListener("focus", () => node.classList.add("is-editing"));
    node.addEventListener("blur", () => node.classList.remove("is-editing"));

    return node;
  }

  function inlineIconToken(src, alt = "") {
    const safeSrc = text(src).replace(/\]/g, "");
    const safeAlt = text(alt).replace(/[\]\|]/g, "");
    return safeAlt ? `[[icon:${safeSrc}|${safeAlt}]]` : `[[icon:${safeSrc}]]`;
  }

  function renderInlineRichText(node, value) {
    const source = text(value);
    const pattern = /\[\[icon:([^\]|]+)(?:\|([^\]]*))?\]\]/g;
    let lastIndex = 0;
    let match = null;

    node.textContent = "";

    while ((match = pattern.exec(source)) !== null) {
      if (match.index > lastIndex) {
        node.appendChild(document.createTextNode(source.slice(lastIndex, match.index)));
      }

      const image = document.createElement("img");
      image.className = "article-inline-icon";
      image.src = match[1];
      image.alt = match[2] || "";
      image.contentEditable = "false";
      image.dataset.inlineIconSrc = match[1];
      image.dataset.inlineIconAlt = match[2] || "";
      node.appendChild(image);

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < source.length) {
      node.appendChild(document.createTextNode(source.slice(lastIndex)));
    }
  }

  function extractInlineRichText(node) {
    let output = "";

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        output += child.nodeValue || "";
        return;
      }

      if (child.nodeType === Node.ELEMENT_NODE && child.matches("img[data-inline-icon-src]")) {
        output += inlineIconToken(child.dataset.inlineIconSrc, child.dataset.inlineIconAlt);
        return;
      }

      output += child.textContent || "";
    });

    return output.replace(/\s+/g, " ").trim();
  }

  function editableParagraph(value, onInput, placeholder = "") {
    const node = editableText("p", "visual-article-paragraph", "", () => {}, placeholder);
    renderInlineRichText(node, value);

    node.addEventListener("input", () => {
      onInput(extractInlineRichText(node));
    });

    return node;
  }

  function createVisualBlockShell(block, index, label) {
    const shell = document.createElement("section");
    shell.className = "visual-article-block";
    shell.dataset.blockType = block.type;

    if (state.activeBlockIndex === index) {
      shell.classList.add("is-active");
    }

    shell.addEventListener("click", () => {
      state.activeBlockIndex = index;
      dom.blockList.querySelectorAll(".visual-article-block").forEach((node) => node.classList.remove("is-active"));
      shell.classList.add("is-active");
    });

    const labelNode = document.createElement("div");
    labelNode.className = "visual-block-label";
    labelNode.textContent = label;

    const actions = document.createElement("div");
    actions.className = "visual-block-actions";
    actions.append(
      createButton("Нагоре", (event) => {
        event.stopPropagation();
        moveBlock(index, -1);
      }),
      createButton("Надолу", (event) => {
        event.stopPropagation();
        moveBlock(index, 1);
      }),
      createButton("Изтрий", (event) => {
        event.stopPropagation();
        removeBlock(index);
      })
    );

    shell.append(labelNode, actions);
    return shell;
  }

  function imageSizeLabel(size) {
    if (size === "small") {
      return "Малка";
    }

    if (size === "wide") {
      return "Широка";
    }

    return "Стандартна";
  }

  function imageSizeControls(block, index) {
    const group = document.createElement("div");
    group.className = "visual-image-size-controls";

    const label = document.createElement("span");
    label.textContent = "Размер:";
    group.appendChild(label);

    [
      ["small", "Малка"],
      ["standard", "Стандартна"],
      ["wide", "Широка"]
    ].forEach(([size, labelText]) => {
      const button = createButton(labelText, (event) => {
        event.stopPropagation();
        updateBlock(index, "size", size);
        renderEditor(index);
      });

      if ((block.size || "standard") === size) {
        button.classList.add("is-selected");
      }

      group.appendChild(button);
    });

    return group;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Снимката не може да бъде заредена за преглед."));
      reader.readAsDataURL(file);
    });
  }

  function validateLocalImageFile(file, purpose) {
    if (!file) {
      throw new Error("Избери снимка.");
    }

    const allowedTypes = new Set(["image/webp", "image/jpeg", "image/png"]);

    if (!allowedTypes.has(file.type)) {
      throw new Error("Използвай WebP, JPG или PNG снимка.");
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Снимката е твърде тежка. Максимум 2 MB.");
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const width = image.naturalWidth;
        const height = image.naturalHeight;

        if (!width || !height) {
          reject(new Error("Размерите на снимката не могат да бъдат прочетени."));
          return;
        }

        if (purpose === "card") {
          const ratio = width / height;

          if (width < 800 || height < 450) {
            reject(new Error("Корица в Articles трябва да е поне 800x450 px."));
            return;
          }

          if (ratio < 1.68 || ratio > 1.86) {
            reject(new Error("Корица в Articles трябва да е близо до 16:9."));
            return;
          }
        }

        resolve({ width, height });
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Снимката не може да бъде прочетена."));
      };

      image.src = objectUrl;
    });
  }

  async function uploadMediaFile(file, purpose) {
    if (!state.current) {
      throw new Error("Първо избери статия.");
    }

    const articleSlug = fieldValue("alias", state.current.key);

    if (!articleSlug) {
      throw new Error("Липсва линк на статията.");
    }

    const dimensions = await validateLocalImageFile(file, purpose);
    const form = new FormData();
    form.append("file", file);
    form.append("articleSlug", articleSlug);
    form.append("purpose", purpose);

    const response = await fetch("/api/admin/upload-media", {
      method: "POST",
      body: form
    });

    let result = {};

    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Качването не беше успешно.");
    }

    return {
      ...result,
      width: result.width || dimensions.width,
      height: result.height || dimensions.height
    };
  }

  function chooseAndUploadImage(purpose, onUploaded, onLocalPreview) {
    if (!state.current) {
      setStatus("Първо избери статия.", "warning");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/webp,image/jpeg,image/png";

    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];

      if (!file) {
        return;
      }

      try {
        const dimensions = await validateLocalImageFile(file, purpose);
        const localPreviewUrl = await readFileAsDataUrl(file);

        if (onLocalPreview) {
          onLocalPreview(localPreviewUrl, dimensions);
        }

        if (!isLiveAdminHost()) {
          setStatus(`Снимката е валидна (${dimensions.width}x${dimensions.height}), но на localhost е само локален преглед. Публичен път ще има след качване през admin.dkapptools.com.`, "warning");
          return;
        }

        setStatus("Качване на снимката...", "info");
        const uploaded = await uploadMediaFile(file, purpose);
        onUploaded(uploaded.path, uploaded);
        setStatus(`Снимката е качена: ${uploaded.path}`, "success");
      } catch (error) {
        setStatus(error && error.message ? error.message : "Качването не беше успешно.", "error");
      }
    });

    input.click();
  }

  function closeMediaPicker() {
    if (dom.mediaPicker) {
      dom.mediaPicker.hidden = true;
    }

    state.activeMediaSelect = null;
  }

  function openMediaPicker(onSelect) {
    if (!dom.mediaPicker || !dom.mediaPickerGrid) {
      setStatus("Списъкът със снимки не е зареден.", "warning");
      return;
    }

    state.activeMediaSelect = onSelect;
    dom.mediaPickerGrid.innerHTML = "";

    if (!mediaLibrary.length) {
      const empty = document.createElement("p");
      empty.className = "article-editor-status";
      empty.textContent = "Няма намерени снимки в assets/img.";
      dom.mediaPickerGrid.appendChild(empty);
    }

    mediaLibrary.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "media-picker-item";
      button.innerHTML = `
        <img class="media-picker-thumb" src="${escapeHtml(item.path)}" alt="">
        <span class="media-picker-name">${escapeHtml(item.name)}</span>
        <span class="media-picker-path">${escapeHtml(item.path)}</span>
      `;

      button.addEventListener("click", () => {
        if (state.activeMediaSelect) {
          state.activeMediaSelect(item.path);
        }

        closeMediaPicker();
      });

      dom.mediaPickerGrid.appendChild(button);
    });

    dom.mediaPicker.hidden = false;
  }

  function renderImageBlock(block, index) {
    const imageSrc = block.localPreviewSrc || block.src || "";
    const imageSize = block.size === "small" || block.size === "wide" ? block.size : "standard";
    const shell = createVisualBlockShell(block, index, `Снимка в статията · ${imageSizeLabel(imageSize)}`);

    const figure = document.createElement("figure");
    figure.className = `visual-article-figure visual-article-figure--${imageSize}`;

    if (imageSrc) {
      const image = document.createElement("img");
      image.src = imageSrc;
      image.alt = block.alt || "";
      figure.appendChild(image);
    } else {
      const empty = document.createElement("div");
      empty.className = "visual-image-empty";
      empty.textContent = "Няма избрана снимка";
      figure.appendChild(empty);
    }

    figure.appendChild(editableText(
      "figcaption",
      "visual-article-caption",
      block.caption || "",
      (value) => updateBlock(index, "caption", value),
      "Надпис под снимката"
    ));

    const controls = document.createElement("div");
    controls.className = "visual-image-actions";

    controls.append(
      createButton(imageSrc ? "Смени снимката" : "Качи снимка", (event) => {
        event.stopPropagation();
        chooseAndUploadImage(
          "inline",
          (path) => {
            updateBlock(index, "src", path);
            updateBlock(index, "localPreviewSrc", "");
            renderEditor(index);
          },
          (localPreviewUrl) => {
            updateBlock(index, "localPreviewSrc", localPreviewUrl);
            renderEditor(index);
          }
        );
      }),
      createButton("Избери от качени", (event) => {
        event.stopPropagation();
        openMediaPicker((path) => {
          updateBlock(index, "src", path);
          updateBlock(index, "localPreviewSrc", "");
          renderEditor(index);
        });
      }),
      createButton("Премахни снимката", (event) => {
        event.stopPropagation();
        updateBlock(index, "src", "");
        updateBlock(index, "localPreviewSrc", "");
        renderEditor(index);
      })
    );

    shell.append(figure, imageSizeControls(block, index), controls);
    return shell;
  }

  function renderBlock(block, index) {
    if (block.type === "paragraph") {
      const shell = createVisualBlockShell(block, index, "Параграф");
      shell.appendChild(editableParagraph(
        block.text || "",
        (value) => updateBlock(index, "text", value),
        "Напиши параграф..."
      ));
      return shell;
    }

    if (block.type === "heading") {
      const shell = createVisualBlockShell(block, index, "Подзаглавие");
      shell.appendChild(editableText(
        "h2",
        "visual-article-heading",
        block.text || "",
        (value) => updateBlock(index, "text", value),
        "Подзаглавие..."
      ));
      return shell;
    }

    if (block.type === "note") {
      const shell = createVisualBlockShell(block, index, "Голям акцент");
      const note = document.createElement("aside");
      note.className = "visual-article-note";
      note.appendChild(editableText(
        "h3",
        "visual-note-heading",
        block.heading || "",
        (value) => updateBlock(index, "heading", value),
        "Заглавие на акцента..."
      ));
      note.appendChild(editableText(
        "p",
        "visual-note-text",
        block.text || "",
        (value) => updateBlock(index, "text", value),
        "Текст на акцента..."
      ));
      shell.appendChild(note);
      return shell;
    }

    if (block.type === "cardGrid") {
      const shell = createVisualBlockShell(block, index, "Две карти");
      const grid = document.createElement("div");
      grid.className = "visual-card-grid";

      const cards = block.cards && block.cards.length
        ? block.cards
        : [
            { title: "", text: "" },
            { title: "", text: "" }
          ];

      cards.forEach((card, cardIndex) => {
        const cardNode = document.createElement("article");
        cardNode.className = "visual-card";
        cardNode.appendChild(editableText(
          "h3",
          "visual-card-title",
          card.title || "",
          (value) => updateBlock(index, "title", value, cardIndex),
          "Заглавие на карта..."
        ));
        cardNode.appendChild(editableText(
          "p",
          "visual-card-text",
          card.text || "",
          (value) => updateBlock(index, "text", value, cardIndex),
          "Текст на карта..."
        ));
        grid.appendChild(cardNode);
      });

      shell.appendChild(grid);
      return shell;
    }

    if (block.type === "list") {
      const shell = createVisualBlockShell(block, index, "Списък");
      const list = document.createElement("ul");
      list.className = "visual-article-list";

      const items = block.items && block.items.length ? block.items : [""];

      items.forEach((item, itemIndex) => {
        const li = document.createElement("li");
        li.appendChild(editableText(
          "span",
          "visual-list-item",
          item || "",
          (value) => {
            const nextItems = [...items];
            nextItems[itemIndex] = value;
            updateBlock(index, "items", nextItems);
          },
          "Елемент от списък..."
        ));
        list.appendChild(li);
      });

      const addItem = createButton("+ Ред в списъка", (event) => {
        event.stopPropagation();
        updateBlock(index, "items", [...items, ""]);
        renderEditor(index);
      });
      addItem.classList.add("visual-list-add");

      shell.append(list, addItem);
      return shell;
    }

    if (block.type === "image") {
      return renderImageBlock(block, index);
    }

    const fallback = createVisualBlockShell(block, index, blockLabel(block.type));
    fallback.appendChild(document.createTextNode(blockLabel(block.type)));
    return fallback;
  }

  function renderArticleHeader() {
    const header = document.createElement("header");
    header.className = "visual-article-header";
    header.append(
      editableText(
        "h1",
        "visual-article-title",
        fieldValue("title"),
        (value) => setFieldValue("title", value),
        "Заглавие на статията..."
      ),
      editableText(
        "p",
        "visual-article-description",
        fieldValue("description"),
        (value) => setFieldValue("description", value),
        "Кратко описание..."
      )
    );

    return header;
  }

  function renderEditor(focusIndex = null) {
    if (!dom.blockList || !state.current) {
      return;
    }

    dom.blockList.innerHTML = "";

    const article = document.createElement("article");
    article.className = "visual-article-canvas";
    article.appendChild(renderArticleHeader());

    const body = document.createElement("div");
    body.className = "visual-article-body";

    state.current.blocks.forEach((block, index) => {
      body.appendChild(renderBlock(block, index));
    });

    article.appendChild(body);
    dom.blockList.appendChild(article);

    if (focusIndex !== null && focusIndex >= 0) {
      const block = dom.blockList.querySelectorAll(".visual-article-block")[focusIndex];

      if (block) {
        block.classList.add("is-new");
        block.scrollIntoView({ block: "center", behavior: "smooth" });

        const editable = block.querySelector("[contenteditable='true']");

        if (editable) {
          editable.focus();
        }

        window.setTimeout(() => block.classList.remove("is-new"), 1400);
      }
    }
  }

  function refreshStaticMediaControls() {
    const field = fields.cardImage;

    if (!field || field.dataset.cleanMediaControls === "true") {
      return;
    }

    field.dataset.cleanMediaControls = "true";

    const parent = field.closest(".article-field");

    if (!parent) {
      return;
    }

    const row = document.createElement("div");
    row.className = "media-field-row";
    parent.insertBefore(row, field);
    row.appendChild(field);

    const upload = createButton("Качи снимка", () => {
      chooseAndUploadImage(
        "card",
        (path) => {
          field.value = path;
          updateStaticMediaPreview(parent, field.value);
        },
        (localPreviewUrl) => {
          updateStaticMediaPreview(parent, localPreviewUrl, "Локален преглед · още не е качена");
        }
      );
    });

    const choose = createButton("Избери от качени", () => {
      openMediaPicker((path) => {
        field.value = path;
        updateStaticMediaPreview(parent, path, "Избрана от качени");
      });
    });

    const remove = createButton("Премахни", () => {
      field.value = "";
      updateStaticMediaPreview(parent, "");
    });

    row.append(upload, choose, remove);

    const preview = document.createElement("div");
    preview.className = "media-image-preview";
    preview.hidden = true;
    parent.appendChild(preview);

    field.addEventListener("input", () => updateStaticMediaPreview(parent, field.value));
    updateStaticMediaPreview(parent, field.value);
  }

  function updateStaticMediaPreview(parent, src, details = "") {
    const preview = parent ? parent.querySelector(".media-image-preview") : null;

    if (!preview) {
      return;
    }

    if (!src) {
      preview.hidden = true;
      preview.innerHTML = "";
      return;
    }

    preview.hidden = false;
    preview.innerHTML = `
      <img src="${escapeHtml(src)}" alt="">
      ${details ? `<span>${escapeHtml(details)}</span>` : ""}
    `;
  }

  function slugifyArticleTitle(title) {
    return text(title)
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function existingArticleKeys() {
    const keys = new Set(Object.keys(sources));

    document.querySelectorAll("[data-article-edit]").forEach((button) => {
      const key = button.getAttribute("data-article-edit");

      if (key) {
        keys.add(key);
      }
    });

    return keys;
  }

  function uniqueArticleKey(baseKey) {
    const existing = existingArticleKeys();
    let key = baseKey || "new-article";
    let counter = 2;

    while (existing.has(key)) {
      key = `${baseKey}-${counter}`;
      counter += 1;
    }

    return key;
  }

  function createBaseFrontMatter(title) {
    return [
      "layout: article-blocks.njk",
      `title: ${yamlQuote(title)}`,
      'description: ""',
      'category: ""',
      'relatedApp: ""',
      'readTime: "3 min read"',
      "published: true",
      'image: ""',
      'cardImage: ""',
      'cardImageAlt: ""'
    ].join("\n");
  }

  function createNewArticle(title, alias = "") {
    const cleanTitle = text(title).trim();

    if (!cleanTitle) {
      setStatus("Въведи заглавие за новата статия.", "warning");
      return;
    }

    const baseKey = slugifyArticleTitle(alias || cleanTitle);

    if (!baseKey) {
      setStatus("Линкът трябва да съдържа латински букви или цифри.", "error");
      return;
    }

    const key = uniqueArticleKey(baseKey);
    const source = {
      key,
      path: `src/articles/${key}.md`,
      url: `https://dkapptools.com/articles/${key}/`,
      frontMatter: createBaseFrontMatter(cleanTitle),
      title: cleanTitle,
      description: "",
      category: "",
      relatedApp: "",
      readTime: "3 min read",
      image: "",
      cardImage: "",
      cardImageAlt: "",
      published: true,
      blocks: [{ type: "paragraph", text: "" }]
    };

    sources[key] = normalizeArticleSource(source);
    setArticle(source);
    closeNewArticleDialog();
    setStatus("Новата статия е създадена в редактора. Напиши съдържанието, прегледай и запази.", "success");
  }

  function openNewArticleDialog() {
    if (!dom.newArticleModal || !dom.newArticleTitle || !dom.newArticleAlias) {
      setStatus("Формата за нова статия не е намерена.", "error");
      return;
    }

    dom.newArticleTitle.value = "";
    dom.newArticleAlias.value = "";
    dom.newArticleAlias.dataset.userEdited = "";
    dom.newArticleModal.hidden = false;
    dom.newArticleTitle.focus();
  }

  function closeNewArticleDialog() {
    if (dom.newArticleModal) {
      dom.newArticleModal.hidden = true;
    }
  }

  async function saveArticle() {
    if (!state.current) {
      setStatus("Първо избери или създай статия.", "warning");
      return;
    }

    const draft = {
      savedAt: new Date().toISOString(),
      articlePath: state.current.path,
      content: buildArticleContent(),
      preview: buildDraft()
    };

    localStorage.setItem(LOCAL_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(draft.preview));

    if (isLocalAdminMode()) {
      setStatus("Запазено като локална чернова в браузъра. Файловете не се променят на localhost; реалният запис ще работи през admin.dkapptools.com.", "warning");
      return;
    }

    if (!isLiveAdminHost()) {
      setStatus("Този домейн не записва статии. Използвай защитения admin домейн за реален запис.", "warning");
      return;
    }

    if (dom.saveButton) {
      dom.saveButton.disabled = true;
    }

    setStatus("Записване...", "info");

    try {
      const response = await fetch("/api/admin/save-article", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          articlePath: state.current.path,
          content: draft.content,
          commitMessage: `Update article: ${draft.preview.title || state.current.key}`
        })
      });

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Записът не беше успешен.");
      }

      setStatus("Запазено. Сайтът ще се обнови след публичното качване.", "success");
    } catch (error) {
      const message = error && error.message ? error.message : "Записът не беше успешен.";
      setStatus(message.startsWith("Missing GITHUB_") ? "Липсва настройка за записване в Cloudflare." : message, "error");
    } finally {

    if (dom.saveButton) {
        dom.saveButton.disabled = false;
      }
    }
  }

  function bindEvents() {
    document.querySelectorAll("[data-media-picker-close]").forEach((node) => {
      node.addEventListener("click", closeMediaPicker);
    });

    document.querySelectorAll("[data-article-edit]").forEach((node) => {
      node.addEventListener("click", () => openEditor(node.getAttribute("data-article-edit")));
    });

    document.querySelectorAll("[data-add-article-block]").forEach((node) => {
      node.addEventListener("click", () => {
        if (!state.current) {
          setStatus("Първо избери или създай статия.", "warning");
          return;
        }

        const type = node.getAttribute("data-add-article-block");
        const insertIndex = state.activeBlockIndex === null
          ? state.current.blocks.length
          : state.activeBlockIndex + 1;

        state.current.blocks.splice(insertIndex, 0, defaultBlock(type));
        state.activeBlockIndex = insertIndex;
        setStatus(`Добавен е нов блок: ${blockLabel(type)}.`, "success");
        renderEditor(insertIndex);
      });
    });

    if (dom.previewButton) {
      dom.previewButton.addEventListener("click", openPreview);
    }

    if (dom.saveButton) {
      dom.saveButton.addEventListener("click", saveArticle);
    }

    if (dom.newArticleButton) {
      dom.newArticleButton.addEventListener("click", openNewArticleDialog);
    }

    if (dom.newArticleTitle && dom.newArticleAlias) {
      dom.newArticleTitle.addEventListener("input", () => {
        if (dom.newArticleAlias.dataset.userEdited === "true") {
          return;
        }

        dom.newArticleAlias.value = slugifyArticleTitle(dom.newArticleTitle.value);
      });

      dom.newArticleAlias.addEventListener("input", () => {
        dom.newArticleAlias.dataset.userEdited = "true";
        dom.newArticleAlias.value = slugifyArticleTitle(dom.newArticleAlias.value);
      });

      dom.newArticleTitle.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          createNewArticle(dom.newArticleTitle.value, dom.newArticleAlias.value);
        }
      });
    }

    if (dom.newArticleCreate) {
      dom.newArticleCreate.addEventListener("click", () => {
        createNewArticle(
          dom.newArticleTitle ? dom.newArticleTitle.value : "",
          dom.newArticleAlias ? dom.newArticleAlias.value : ""
        );
      });
    }

    document.querySelectorAll("[data-new-article-cancel]").forEach((button) => {
      button.addEventListener("click", closeNewArticleDialog);
    });

    if (dom.newArticleModal) {
      dom.newArticleModal.addEventListener("click", (event) => {
        if (event.target === dom.newArticleModal) {
          closeNewArticleDialog();
        }
      });
    }

    Object.entries(fields).forEach(([name, field]) => {
      if (!field) {
        return;
      }

      field.addEventListener("input", () => {
        if (!state.current) {
          return;
        }

        if (name === "published") {
          state.current.published = field.value === "true";
          return;
        }

        state.current[name] = field.value;
      });
    });
  }
bindEvents();
})();
