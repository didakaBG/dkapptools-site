# DK App Tools Protected Admin Implementation Plan

## Status

This document describes the preferred secure implementation direction for the future DK App Tools admin/editor.

The current website is a static Eleventy site deployed through Cloudflare Pages.

The final admin/editor must support:

- Bulgarian admin interface
- draft-first article creation
- preview before publishing
- publish only after approval
- no Git/terminal workflow for content writers
- no public write access
- no GitHub tokens in public JavaScript

## Core Security Rule

The admin/editor must not be a public writable `/admin/` page.

A visual admin prototype is allowed only if it has no write ability.

A real editor with Save Draft, Preview, Publish, image upload, or maintenance mode changes must require authentication and protected server-side write handling.

## Preferred Architecture

Preferred direction:

1. Keep the public website static.
2. Protect the admin area with Cloudflare Access / Zero Trust or equivalent.
3. Serve the Bulgarian admin UI only after access is approved.
4. Use a protected backend/server-side function for write actions.
5. Store GitHub or deploy credentials only as server-side secrets.
6. Trigger Cloudflare Pages deployment through normal GitHub integration after content changes.

Expected user-facing workflow:

1. Login.
2. Create new article.
3. Save draft.
4. Preview article.
5. Edit if needed.
6. Publish.
7. Article goes live automatically.

The content writer should not see Git, commits, terminal commands, build commands, or deployment steps.

## Recommended Admin Location Options

### Option A: Protected `/admin/`

Example:

- `dkapptools.com/admin/`

Pros:

- simple URL
- same domain
- easy to remember

Cons:

- must be strongly protected
- should not expose a real editor unless authentication is active

### Option B: Protected admin subdomain

Example:

- `admin.dkapptools.com`

Pros:

- cleaner separation from public website
- easier to protect as a separate application
- clearer mental model: public site vs internal tool

Cons:

- extra Cloudflare/domain configuration
- more setup before first release

Preferred long-term direction:

- use protected admin subdomain if setup remains manageable
- otherwise use protected `/admin/` route

## Authentication / Access Protection

The admin must require authentication before any real editor is usable.

Preferred protection:

- Cloudflare Access / Zero Trust
- allow only approved email accounts
- optionally require one-time code or identity provider login
- block all public users before loading the editor or before any write action

Important:

Access protection is not just visual hiding.

The protected write endpoint must also validate that the request is allowed.

## Backend / Server-Side Write Layer

The public static site should not write directly to GitHub.

The admin UI should call a protected backend endpoint.

Possible backend:

- Cloudflare Pages Functions
- Cloudflare Worker
- another small backend if needed later

The backend is responsible for:

- verifying the admin request
- validating article fields
- validating draft/published state
- validating image metadata
- writing content files
- writing image files or references
- committing changes to GitHub
- returning success/failure to the admin UI

## Secrets

GitHub tokens, deploy tokens, or write credentials must never be included in public JavaScript.

Required rules:

- store write credentials only as encrypted server-side secrets
- do not commit `.env` or `.dev.vars` files
- do not expose secret values in generated HTML
- do not expose secret values in client-side JavaScript
- do not log secret values

The admin UI can send article data.

The backend performs the privileged write operation.

## GitHub Write Strategy

The backend may use the GitHub REST API to create or update content files.

Possible generated files:

- `src/articles/article-slug.md`
- `src/assets/img/articles/card-image.webp`
- `src/assets/img/articles/inline-image.webp`

Publish behavior:

- draft articles are saved with `published: false`
- published articles are saved with `published: true`
- Cloudflare Pages deploys after the GitHub change reaches the production branch

Possible safer publishing strategy:

- Save Draft writes to a draft branch or draft storage
- Publish merges or commits to `main`
- Cloudflare Pages deploys from `main`

Simpler first production strategy:

- Save Draft writes markdown with `published: false`
- Preview uses the draft content
- Publish changes `published: true`
- Commit goes to `main`

This simpler strategy is acceptable only if direct draft URLs and preview behavior are handled carefully.

## Preview Strategy

Preview must not publish the article publicly first.

Preview should show:

- article page preview
- article card preview
- search result preview
- mobile layout preview if practical
- image quality warnings
- missing alt text warnings
- missing caption warnings
- draft/published state

Possible preview options:

### Option A: Local/admin-rendered preview

The admin UI renders a preview from the draft data before saving/publishing.

Pros:

- no public draft URL required
- fast feedback

Cons:

- preview renderer must match public article layout closely

### Option B: Protected preview route

The backend generates or serves a protected preview only after login.

Pros:

- closer to real rendered output
- better for full layout review

Cons:

- more backend complexity

Preferred first implementation:

- admin-rendered preview first
- protected rendered preview later if needed

## Article Editor Model

The editor should use structured blocks instead of one uncontrolled raw HTML field.

Supported planned blocks:

- paragraph
- heading
- callout
- image figure
- checklist
- note/warning

The writer should be able to:

- add text
- add headings
- add card image
- add inline image with caption and alt text
- reorder blocks
- preview the result
- save as draft
- publish only after approval

## Image Handling

Card thumbnails:

- preferred around 800x450 or larger
- clear, wide ratio
- no stretched low-resolution images
- alt text required if image exists

Inline article images:

- preferred around 1200x675 or larger
- optional
- alt text required
- caption required
- should support article content
- should not be used as random filler

Future admin should warn when images are missing required text or are likely too small.

## Maintenance Mode

The future admin may include maintenance mode controls.

Rules:

- maintenance mode toggle must require authentication
- public visitors must not be able to toggle it
- write operation must go through protected backend
- config currently starts from `src/_data/site.json`

Current foundation:

- `maintenanceMode`
- `maintenanceMessage`

## First Safe Implementation Milestones

### Milestone 1: Protected admin architecture

- decide route: `/admin/` or `admin.dkapptools.com`
- configure access protection
- confirm only approved users can enter
- keep editor read-only or prototype-only until backend exists

### Milestone 2: Bulgarian editor UI

- article metadata form
- card image field
- structured block editor shell
- Save Draft / Preview / Publish buttons
- no real write operations yet

### Milestone 3: Protected backend write endpoint

- server-side function
- secret GitHub token
- request validation
- create/update article files
- no token exposure to browser

### Milestone 4: Draft save

- save article with `published: false`
- validate required metadata
- validate block data
- return success in Bulgarian UI

### Milestone 5: Preview

- preview article before publish
- preview card appearance
- preview search result appearance
- warn about missing image metadata

### Milestone 6: Publish

- change article to `published: true`
- commit/update content
- trigger normal Cloudflare Pages deploy through GitHub
- show clear publish success/failure message

## Non-Goals For Now

Do not build yet:

- public writable admin
- GitHub token in browser
- unprotected Publish button
- complex user roles
- comments/community system
- database-backed CMS
- public account system

## Current Decision

Do not publish a real admin/editor UI until access protection and server-side write handling are designed.

Keep the public `/admin/` harmless until protection is ready.

The long-term goal remains:

Login -> Bulgarian admin UI -> Draft -> Preview -> Publish -> automatic live deployment.
