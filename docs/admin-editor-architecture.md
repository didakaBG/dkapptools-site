# DK App Tools Admin Panel / Editor Architecture Plan

## Status

This document defines the planned admin/editor direction for the DK App Tools static website.

Current stack:

- Eleventy + Bootstrap static site
- Cloudflare Pages deployment
- GitHub repository as source of truth
- Static public pages
- No database required for the public site
- No tracking or analytics

Articles v1 is already available as a temporary checkpoint. The current article workflow is acceptable for now, but it is not the final editor system.

## Core Direction

The admin/editor system should support structured content, not one raw unstructured text field.

The public website should remain static, fast, reliable, and Git-controlled.

Preferred long-term direction:

- Git remains the source of truth.
- Article data is stored in repository files.
- Cloudflare Pages builds the public static site.
- Admin tools write validated content back to the repository.
- Public pages render only approved/published content.

## Why Not Build a Heavy Admin Panel First

A custom admin panel is possible, but it should not be built before the content model is stable.

Building the admin too early would create avoidable complexity:

- authentication
- image upload rules
- GitHub write permissions
- draft/published workflow
- validation
- rollback behavior
- maintenance mode behavior
- editor UI design

The safer route is:

1. Define the content schema.
2. Standardize current articles.
3. Add draft/published support.
4. Add image metadata rules.
5. Only then choose Static CMS or custom admin.

## Possible Admin Approaches

### Option 1: Local-only Authoring

How it works:

- Content is edited locally.
- Images are placed manually in the repository.
- Build is tested with npm.cmd run build.
- Changes are committed and pushed to GitHub.
- Cloudflare Pages deploys from GitHub.

Pros:

- safest option
- no public admin attack surface
- no authentication complexity
- easy rollback through Git

Cons:

- less convenient long-term
- requires local files and Git
- not a true browser admin panel

Best use:

- current stage
- early article structure work
- small number of articles

### Option 2: Static CMS / Git-based CMS

How it works:

- A ready-made CMS provides an admin UI.
- The CMS writes article files to Git.
- Images are stored in a configured media folder.
- GitHub remains the source of truth.

Pros:

- faster than custom admin
- structured fields
- easier writing workflow

Cons:

- CMS limitations may shape the project
- authentication still needs care
- may not feel fully custom/premium
- may become limiting later

Best use:

- if article publishing becomes frequent before a custom admin is justified

### Option 3: Custom Admin Panel

Possible architecture:

- /admin/ editor UI
- Cloudflare Pages Functions as server-side layer
- GitHub API for writing content files
- validated image upload workflow
- draft/published state
- maintenance mode toggle
- future polls/feedback moderation
- future app catalog editing

Pros:

- fully controlled experience
- matches DK App Tools branding
- can support articles, app pages, maintenance mode, polls, and future admin tools

Cons:

- more complex
- requires secure authentication
- requires safe GitHub write flow
- requires validation
- should not be built before the schema is stable

Best use:

- later stage
- after the content model is stable

## Recommended Roadmap

### Phase 1: Architecture Document

Define the admin/editor direction.

No public site behavior changes.

### Phase 2: Article Schema Cleanup

Standardize all current articles with consistent front matter:

- title
- description
- category
- tags
- date
- dateLabel
- published
- cardImage
- cardImageAlt

Public article lists should only show published content.

### Phase 3: Draft Support

Draft articles may exist in the repository but should not appear publicly.

Rules:

- published: true means visible in /articles/ and /search/
- published: false means hidden from /articles/ and /search/

Preferred V1 behavior:

- hide drafts from article index and search
- keep implementation simple

### Phase 4: Image Rules

Article images must be controlled and high quality.

Card thumbnails:

- used in /articles/ cards
- recommended minimum: about 800x450
- should use a consistent wide ratio
- should not be stretched from low-resolution sources

Article body figures:

- optional
- recommended minimum: about 1200x675 or larger
- must include caption and alt text
- should be controlled inline/section figures
- should not be giant hero images
- should not be pixelated or stretched

If a suitable high-resolution image is not available, the article should not show an inline image.

### Phase 5: Maintenance Mode Foundation

Add a simple static configuration file later, for example:

- maintenanceMode
- maintenanceMessage

Preferred behavior:

- maintenance mode is controlled by repository/config first
- a custom admin toggle can be added later
- no database required for V1

### Phase 6: Admin Panel Decision

After the content schema is stable, choose between:

1. Static CMS / Git-based CMS
2. Custom admin panel using Cloudflare Pages Functions and GitHub API

Preferred long-term direction:

- custom admin panel
- but only after article schema, image rules, draft rules, and maintenance rules are stable

## Planned Article Editor Fields

The future article editor should support:

- title
- description
- category
- tags
- card thumbnail
- card thumbnail alt text
- publish date
- draft/published state

## Planned Content Blocks

The editor should support structured blocks:

- paragraph
- heading
- key idea / callout
- image + caption + alt text
- checklist
- warning / note box

The editor should not be just one raw markdown box.

## Draft / Published Rules

Published content:

- appears in /articles/
- appears in /search/
- can be linked publicly

Draft content:

- should not appear in /articles/
- should not appear in /search/
- should be safe to keep in the repository while unfinished

## Image Upload Rules

The future editor should validate image usage.

For card thumbnails:

- prefer around 800x450 or higher
- avoid blurry or pixelated images
- avoid random decorative images that do not support the article

For inline article images:

- optional
- prefer around 1200x675 or higher
- require alt text
- require caption or description
- avoid stretched low-resolution images
- avoid giant hero-style images inside articles

## Maintenance Mode Rules

Maintenance mode should exist because the website may later have heavier updates.

Goal:

- avoid visitors seeing broken layouts during major updates
- show a clean site-under-update state if needed
- keep the public site controlled and professional

V1 maintenance mode can be static config based.

Initial foundation config:

- file: `src/_data/site.json`
- `maintenanceMode: false` by default
- `maintenanceMessage` stores the public update message
- no public layout behavior is enabled yet

Future admin maintenance toggle can update the config through a safe GitHub-backed workflow.

## Security Notes

The public static website should not expose private write tokens.

If a custom admin panel is built later:

- GitHub tokens must not be exposed in browser JavaScript
- write operations must go through a server-side layer
- admin authentication must be required
- file paths must be validated
- image uploads must be validated
- generated content must be sanitized/controlled
- rollback should remain possible through Git history

## Current Decision

For now, do not build the full admin panel.

Next practical work:

1. Keep Articles v1 as a temporary public checkpoint.
2. Standardize article front matter.
3. Add published/draft field support.
4. Add image metadata fields.
5. Keep the public site static and Git-controlled.
6. Revisit Static CMS vs Custom Admin after the schema is stable.
