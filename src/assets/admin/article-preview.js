(function() {
  const PREVIEW_STORAGE_KEY = "dkArticlePreviewDraft";
  const root = document.querySelector("[data-article-preview-root]");

  function safeText(value) {
    return String(value || "");
  }

  function escapeHtml(value) {
    return safeText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function renderInlineIcons(text) {
    const source = safeText(text);
    const pattern = /\[\[icon:([^\]|]+)(?:\|([^\]]*))?\]\]/g;
    let output = "";
    let lastIndex = 0;
    let match = null;

    while ((match = pattern.exec(source)) !== null) {
      output += escapeHtml(source.slice(lastIndex, match.index));
      output += `<img class="article-inline-icon" src="${escapeAttribute(match[1])}" alt="${escapeAttribute(match[2] || "")}">`;
      lastIndex = pattern.lastIndex;
    }

    output += escapeHtml(source.slice(lastIndex));
    return output;
  }

  function renderParagraph(block) {
    return block.text ? `<p>${renderInlineIcons(block.text)}</p>` : "";
  }

  function renderHeading(block) {
    if (!block.text) {
      return "";
    }

    const id = block.id ? ` id="${escapeAttribute(block.id)}"` : "";
    return `<h2${id}>${escapeHtml(block.text)}</h2>`;
  }

  function renderNote(block) {
    const title = block.title || block.heading || "";
    const heading = title ? `<h2>${escapeHtml(title)}</h2>` : "";
    const text = block.text ? `<p>${renderInlineIcons(block.text)}</p>` : "";

    return heading || text
      ? `<section class="article-note-card">${heading}${text}</section>`
      : "";
  }

  function renderCardGrid(block) {
    if (!Array.isArray(block.cards)) {
      return "";
    }

    const cards = block.cards
      .filter((card) => card && (card.title || card.text))
      .map((card) => `
        <div class="article-note-card">
          ${card.title ? `<h2>${escapeHtml(card.title)}</h2>` : ""}
          ${card.text ? `<p>${renderInlineIcons(card.text)}</p>` : ""}
        </div>
      `)
      .join("");

    return cards ? `<section class="article-card-grid">${cards}</section>` : "";
  }

  function renderList(block) {
    if (!Array.isArray(block.items)) {
      return "";
    }

    const items = block.items
      .filter(Boolean)
      .map((item) => `<li>${renderInlineIcons(item)}</li>`)
      .join("");

    return items ? `<ul>${items}</ul>` : "";
  }

  function renderImage(block) {
    const imageSrc = block.localPreviewSrc || block.src;

    if (!imageSrc) {
      return "";
    }

    const size = block.size === "small" || block.size === "wide" ? block.size : "standard";
    const align = block.align === "left" || block.align === "right" || block.align === "center"
      ? block.align
      : size === "small"
        ? "left"
        : "center";

    return `
      <figure class="article-figure article-figure--${escapeAttribute(size)} article-figure--align-${escapeAttribute(align)}">
        <img src="${escapeAttribute(imageSrc)}" alt="${escapeAttribute(block.alt || "")}">
        ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ""}
      </figure>
    `;
  }

  function renderBlock(block) {
    if (!block || !block.type) {
      return "";
    }

    if (block.type === "paragraph") {
      return renderParagraph(block);
    }

    if (block.type === "heading") {
      return renderHeading(block);
    }

    if (block.type === "note") {
      return renderNote(block);
    }

    if (block.type === "cardGrid") {
      return renderCardGrid(block);
    }

    if (block.type === "list") {
      return renderList(block);
    }

    if (block.type === "image") {
      return renderImage(block);
    }

    return "";
  }

  function readDraft() {
    try {
      return JSON.parse(localStorage.getItem(PREVIEW_STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function renderEmptyState() {
    root.innerHTML = `
      <section class="article-page">
        <article class="article-reader surface-panel">
          <header class="article-note-header">
            <h1 id="intro">Няма данни за преглед</h1>
            <p class="article-summary">Върни се към редактора и натисни „Преглед“ отново.</p>
          </header>
        </article>
      </section>
    `;
  }

  function renderDraft() {
    if (!root) {
      return;
    }

    const draft = readDraft();

    if (!draft) {
      renderEmptyState();
      return;
    }

    const category = safeText(draft.category).trim();
    const title = safeText(draft.title).trim() || "Нова статия";
    const description = safeText(draft.description).trim();
    const readTime = safeText(draft.readTime).trim() || "4 min read";
    const relatedApp = safeText(draft.relatedApp).trim();
    const metaParts = [readTime, relatedApp].filter(Boolean);
    const body = Array.isArray(draft.blocks)
      ? draft.blocks.map(renderBlock).join("")
      : "";

    root.innerHTML = `
      <section class="article-page">
        <article class="article-reader surface-panel">
          <header class="article-note-header">
            ${category ? `<span class="chip">${escapeHtml(category)}</span>` : ""}
            <h1 id="intro">${escapeHtml(title)}</h1>
            ${description ? `<p class="article-summary">${escapeHtml(description)}</p>` : ""}
            ${metaParts.length ? `<p class="article-meta">${escapeHtml(metaParts.join(" · "))}</p>` : ""}
          </header>

          ${body || "<p>Няма добавено съдържание.</p>"}
        </article>
      </section>
    `;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderDraft);
  } else {
    renderDraft();
  }
})();
