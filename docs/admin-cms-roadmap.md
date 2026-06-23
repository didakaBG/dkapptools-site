# DK App Tools Admin CMS Roadmap

## Purpose

The protected DK App Tools admin panel should grow into a small, safe CMS/control center for managing the website.

The goal is to reduce routine manual edits in VS Code and avoid breaking layout, content structure, metadata, links, or build behavior during normal website updates.

The admin CMS should help manage:

- articles
- drafts
- previews
- app/product pages
- media and image quality
- support/FAQ content
- privacy/legal content
- maintenance mode
- site health checks
- publish/deploy status

## Core Architecture

The public website remains a static Eleventy site deployed through Cloudflare Pages.

The admin CMS is protected by Cloudflare Access at:

- `admin.dkapptools.com`

The admin UI must not expose write credentials.

The correct future write flow is:

1. Admin user logs in through Cloudflare Access.
2. Admin UI sends validated content data to a protected server-side endpoint.
3. Server-side backend validates the request.
4. Backend writes or updates files in GitHub.
5. Cloudflare Pages deploys the updated site.
6. Public visitors see the updated content after deploy.

The browser must never receive:

- GitHub token
- deploy token
- write secret
- private API secret

## Main CMS Sections

### 1. Dashboard

The dashboard should summarize website health and content status.

Planned cards:

- published articles count
- draft articles count
- apps live count
- coming soon apps count
- missing image metadata count
- low-resolution image warnings
- broken internal link warnings
- last deploy status
- maintenance mode state

Example dashboard indicators:

- Articles: 3 published / 1 draft
- Apps: 1 active / 4 planned
- Media: 0 missing alt text
- Deploy: last build successful
- Maintenance: off

### 2. Articles

The articles section should allow safe article creation and management.

Planned fields:

- title
- slug
- summary/description
- category
- tags
- card image
- card image alt text
- publish date
- published/draft state
- content blocks

Planned content blocks:

- heading
- paragraph
- callout
- image figure
- checklist
- warning/note

The admin should avoid relying on raw markdown as the main editing experience.

Raw markdown may exist later as an advanced/export view, but normal writing should be structured and safer.

### 3. Article Preview

Preview must happen before publishing.

Preview should show:

- full article page preview
- article card preview
- search result preview
- mobile/narrow layout preview if practical
- missing metadata warnings
- image size warnings

Preview must not publish the article publicly first.

Preferred first implementation:

- admin-rendered preview inside the protected UI

Preferred later implementation:

- protected server-rendered preview route that more closely matches the public article layout

### 4. App / Product Pages Manager

The CMS should eventually manage app/product pages.

Planned editable app data:

- app name
- status: coming soon / live / archived
- short description
- long description
- feature cards
- screenshots
- Google Play URL
- privacy policy URL
- support URL
- latest version
- changelog/release notes
- hero text
- CTA state

Important app page examples:

- Offline FileSecure
- future DK App Tools apps

The goal is to avoid editing product page source files for simple content updates.

### 5. Media Library

The CMS should manage image and media quality.

Planned media fields/checks:

- file name
- pixel dimensions
- file size
- usage locations
- alt text
- caption
- recommended use: card / hero / inline article
- low-resolution warning
- missing alt text warning
- unused media warning

Image quality rules:

- article card images should be clear and wide
- inline article images should not be stretched
- low-resolution images should trigger warnings
- images should support the content, not act as random filler

### 6. Support / FAQ Manager

The CMS should eventually manage support content.

Planned fields:

- question
- answer
- related app
- category
- published/draft state
- last updated date

Possible FAQ categories:

- Offline FileSecure
- privacy
- recovery
- billing / Pro
- installation
- troubleshooting

### 7. Privacy / Legal Center

The CMS should help track privacy/legal content.

Planned items:

- website privacy notice
- Offline FileSecure privacy policy
- app-specific privacy pages
- last updated date
- support email
- data safety notes
- policy review reminders

Important rule:

Legal/privacy content should still be reviewed carefully before publishing.

### 8. Maintenance Mode

Maintenance mode should be controlled only through the protected admin.

Current foundation file:

- `src/_data/site.json`

Current fields:

- `maintenanceMode`
- `maintenanceMessage`

Future CMS control:

- toggle maintenance mode
- edit maintenance message
- preview maintenance page
- publish the maintenance config safely

Maintenance mode changes must go through the protected backend.

### 9. Site Health Checks

The CMS should warn before publishing broken or incomplete content.

Planned checks:

- missing article title
- missing description
- missing card image
- missing alt text
- low-resolution image
- duplicate slug
- broken internal link
- draft linked from public page
- app page missing privacy link
- app page missing support link
- maintenance mode accidentally left on
- empty sections
- invalid front matter
- build risk warnings

The CMS should act as a safety layer, not just an editor.

### 10. Deploy / Publish Status

The CMS should show what happens after publishing.

Planned publish status steps:

- validating content
- creating commit
- commit created
- Cloudflare Pages deploy started
- build succeeded
- content is live

If deployment fails, the CMS should show:

- build failed
- likely reason
- article remains draft or not confirmed live
- next action

## Safe Implementation Phases

### Phase 1: Protected CMS Dashboard Mock

Status: next planned phase.

Goals:

- improve protected admin UI layout
- show dashboard cards
- show CMS sections
- keep everything mock/read-only
- keep Save Draft and Publish disabled

No real write behavior.

### Phase 2: Articles Editor Mock

Goals:

- article metadata form
- structured block editor mock
- card preview mock
- article preview mock
- validation warning mock

No real write behavior.

### Phase 3: Real Save Draft

Goals:

- protected server-side endpoint
- write markdown with `published: false`
- validate fields server-side
- commit draft safely
- no GitHub token in browser

### Phase 4: Real Preview

Goals:

- preview draft before publish
- preview page/card/search appearance
- avoid public draft exposure
- warn about missing metadata

### Phase 5: Real Publish

Goals:

- change `published: true`
- commit to GitHub
- trigger Cloudflare Pages deploy through GitHub integration
- show deploy status
- make article public only after successful publish path

### Phase 6: Media Library

Goals:

- manage images
- validate image dimensions
- track usage
- require alt text/captions
- warn about low-quality assets

### Phase 7: App Pages Manager

Goals:

- manage app/product page content
- update app status
- update Google Play links
- update feature cards
- update screenshots and changelog

### Phase 8: Site Health + Maintenance Mode

Goals:

- show global website health
- detect content problems
- manage maintenance mode safely
- prevent accidental public breakage

## Non-Goals For Now

Do not build yet:

- public admin editor
- public password login form
- GitHub token in browser
- real Publish button without backend
- database-backed CMS
- public user accounts
- comments/community system
- complex user roles
- uncontrolled raw HTML editor

## Current Rule

The CMS may look polished and realistic, but until the protected backend exists:

- Save Draft must stay disabled
- Publish must stay disabled
- image upload must stay disabled or mock-only
- maintenance writes must stay disabled
- no credentials may be exposed in browser code

## Long-Term Goal

The final DK App Tools CMS should let the site owner manage routine content safely without touching code.

Target workflow:

1. Open `admin.dkapptools.com`.
2. Pass Cloudflare Access.
3. Create or edit content in Bulgarian admin UI.
4. Preview exactly how users will see it.
5. Save draft or publish.
6. Backend commits safely to GitHub.
7. Cloudflare Pages deploys.
8. Public site updates automatically.

The admin CMS should become the safe control center for the whole DK App Tools website.
