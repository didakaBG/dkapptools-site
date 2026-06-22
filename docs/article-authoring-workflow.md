# DK App Tools Article Authoring Workflow

## Status

This document defines the practical article authoring workflow before the full admin/editor system exists.

The website currently uses:

- Eleventy static generation
- GitHub as source of truth
- Cloudflare Pages deployment
- structured article metadata
- collections.publishedArticles for public article listings and search

A full browser-based admin/editor is planned later, but articles can still be created safely before that if the workflow is controlled.

## Core Rule

Articles should not be published immediately after creation.

Preferred workflow:

1. Create article as draft.
2. Preview locally.
3. Review layout, text, images, and search behavior.
4. Only then change it to published.
5. Commit and push.

This prevents publishing unfinished content, finding visual problems, deleting it, and recreating it repeatedly.

## Current Manual Workflow

### 1. Create the article file

Create the article under:

- src/articles/

Example:

- src/articles/example-article-slug.md

### 2. Use standard front matter

Every article should include consistent metadata.

Required fields:

- layout
- title
- description
- date
- dateLabel
- category
- tags
- relatedApp
- image
- published
- cardImage
- cardImageAlt
- permalink
- activeNav

Important:

- New articles should start with published: false.
- Do not start unfinished articles with published: true.
- Publishing should happen only after preview and approval.

### 3. Preview before publishing

Run the local dev server:

npm.cmd run dev

Open the local site in the browser and inspect the direct article URL.

Preview should check:

- title
- description
- spacing
- mobile layout
- card thumbnail quality
- inline image quality
- captions and alt text
- article readability
- search behavior
- no pixelated or stretched images

### 4. Verify draft behavior

When published is false:

- the article should not appear in /articles/
- the article should not appear in /search/
- the article should not appear in the global search data

Current V1 limitation:

- the direct article page may still build locally
- this is acceptable for previewing
- direct URL blocking can be handled later if needed

### 5. Publish only after review

After preview and approval, change:

- published: false

to:

- published: true

Then run:

- npm.cmd run build
- git diff --check

Only commit after the build passes and the article has been reviewed.

## Image Rules

### Card thumbnails

Card thumbnails should be:

- about 800x450 or larger
- wide ratio
- clear and not pixelated
- relevant to the article
- not random decorative filler

Fields:

- cardImage
- cardImageAlt

The older image field may remain as fallback.

### Inline images

Inline article images should be optional.

Use inline images only when they are high quality.

Recommended:

- about 1200x675 or larger
- has alt text
- has caption
- supports the article content

Avoid:

- giant hero images
- stretched images
- low-resolution screenshots
- images inserted only to fill space

If there is no good image, the article should work without one.

## Future Admin Panel Language

The future browser-based admin panel should be in Bulgarian by default.

The content writer should see Bulgarian labels and actions such as:

- Нова статия
- Запази чернова
- Преглед
- Публикувай
- Качи снимка
- Добави блок
- Върни за редакция

The writer should not need to understand Git, commits, terminal commands, builds, or deployment steps.

## Future Admin/Editor Workflow

The future editor should follow this model:

1. Create new article as draft by default.
2. Fill metadata.
3. Add structured content blocks.
4. Add card thumbnail if available.
5. Add inline images only if suitable.
6. Preview the article.
7. Validate required fields.
8. Publish only after approval.

The editor should make it hard to accidentally publish unfinished content.

## Future Preview Requirements

The future admin/editor should support preview before publishing.

Preview should show:

- article detail page
- article card appearance
- search result appearance
- mobile layout if possible
- missing image warnings
- low-quality image warnings where possible
- missing alt text warnings
- draft/published status

The preview should not require publishing the article publicly first.

## Validation Before Publish

Before publishing, the editor should require:

- title
- description
- category
- published state
- valid slug or permalink
- card image alt text if card image exists
- alt text and caption for inline images
- no unsupported block types
- no obviously missing required block fields

## Current Decision

For now:

- keep manual article files
- start unfinished articles with published: false
- preview locally before publishing
- commit only after build and review
- build the future editor around draft-first preview-first publishing
