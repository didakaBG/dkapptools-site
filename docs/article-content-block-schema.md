# DK App Tools Article Content Block Schema

## Status

This document defines the planned structured article content model for the future DK App Tools editor.

The current public Articles v1 section is a temporary checkpoint. Articles are currently written manually as markdown/Nunjucks content, but the future editor should use structured content blocks.

The goal is to avoid one large raw text field and instead make article content predictable, reusable, and safe to render.

## Core Principle

Articles should be built from controlled blocks.

The editor should guide the author into creating clean article structure:

- clear intro
- readable sections
- controlled callouts
- optional high-quality images
- practical checklists
- warnings or notes when needed

This keeps the public site consistent and avoids messy article layouts.

## Article Metadata

Each article should support these metadata fields:

- title
- description
- category
- tags
- related app
- publish date
- date label
- published state
- card thumbnail
- card thumbnail alt text
- permalink or slug

Current front matter foundation:

- title
- description
- category
- tags
- date
- dateLabel
- relatedApp
- image
- published
- cardImage
- cardImageAlt
- permalink
- activeNav

The old `image` field can remain as a fallback while `cardImage` becomes the preferred card thumbnail field.

## Published State

The current public behavior:

- `published: true` means the article appears in public article listings and search.
- `published: false` means the article is hidden from public article listings and search.

Current implementation:

- Eleventy collection: `collections.publishedArticles`
- Used by `/articles/`
- Used by `/search/`
- Used by the global base search data

Current V1 limitation:

- draft article pages may still be built at their direct URL
- direct URL blocking can be handled later if needed

## Image Rules

### Card Thumbnails

Article cards may use thumbnail images.

Rules:

- preferred field: `cardImage`
- fallback field: `image`
- alt text field: `cardImageAlt`
- recommended minimum size: about 800x450
- should use a consistent wide ratio
- should not be stretched from low-resolution images
- should visually support the article topic
- should not be random decorative filler

### Inline Article Images

Inline article images should be optional.

Rules:

- recommended minimum size: about 1200x675 or larger
- must include alt text
- must include caption or description
- should appear as controlled inline/section figures
- should not be giant hero images
- should not be pixelated or stretched
- should not be used if no suitable high-quality image exists

If an image is low quality, the editor should encourage not using it.

## Planned Block Types

### Paragraph Block

Purpose:

- normal article body text

Fields:

- type: paragraph
- text

Rendering:

- standard article paragraph

Rules:

- should be concise
- should not contain layout HTML
- should not be used for headings or callouts

### Heading Block

Purpose:

- section heading inside the article

Fields:

- type: heading
- level
- text
- anchor

Allowed levels:

- h2
- h3

Rules:

- h1 is reserved for article title
- heading text should be clear and descriptive
- anchors can be generated automatically later

### Key Idea / Callout Block

Purpose:

- highlight the central point of a section

Fields:

- type: callout
- label
- title
- text

Default label examples:

- Key idea
- Practical note
- Good rule

Rendering:

- compact highlighted panel inside the article

Rules:

- should not be overused
- should support the article, not replace normal structure

### Image Figure Block

Purpose:

- insert a controlled inline image with description

Fields:

- type: image
- src
- alt
- caption
- credit
- width
- height

Required:

- src
- alt
- caption

Optional:

- credit
- width
- height

Rules:

- image should be high quality
- avoid low-resolution stretched images
- avoid giant hero-style images inside the article
- image must support the content around it

### Checklist Block

Purpose:

- practical list of steps or habits

Fields:

- type: checklist
- title
- items

Each item:

- text
- checkedByDefault

Rendering:

- structured list
- can be styled differently from normal bullets

Rules:

- useful for practical guidance
- should not be used for every normal list

### Warning / Note Block

Purpose:

- highlight caution, limitation, or important context

Fields:

- type: note
- tone
- title
- text

Allowed tones:

- note
- warning
- privacy
- limitation

Rendering:

- visually distinct note panel

Rules:

- warning tone should be used only when there is a real caution
- should be clear and calm, not dramatic

## Example Future Structured Article Shape

A future article could be stored as structured data like this conceptually:

- metadata
  - title
  - description
  - category
  - tags
  - published
  - cardImage
  - cardImageAlt
- blocks
  - paragraph
  - callout
  - heading
  - paragraph
  - checklist
  - note
  - image

The exact storage format can be decided later:

- markdown with structured shortcodes
- JSON
- YAML
- hybrid markdown + front matter
- custom admin-generated content files

Preferred direction:

- keep current markdown/Nunjucks articles for now
- define the schema first
- later build the admin/editor around the schema

## Editor Behavior Goals

The future editor should:

- guide the author through structured fields
- prevent missing alt text for images
- discourage low-resolution images
- separate card thumbnail from inline article figures
- support draft/published state
- preview article layout before publishing
- keep generated content consistent
- avoid raw uncontrolled HTML where possible

## Validation Rules

The future editor should validate:

- title is present
- description is present
- category is present
- published state is explicit
- card image has alt text if present
- inline images have alt text and caption
- image dimensions are suitable where possible
- block type is one of the supported types
- required fields exist for each block type

## Current Decision

Do not build the full block editor yet.

Next practical steps:

1. Keep current Articles v1 public layout.
2. Keep article metadata standardized.
3. Use `collections.publishedArticles` for public article listings and search.
4. Keep `src/_data/site.json` as maintenance mode config foundation.
5. Plan the editor around structured content blocks.
6. Revisit the actual admin/editor implementation after the content model is stable.
