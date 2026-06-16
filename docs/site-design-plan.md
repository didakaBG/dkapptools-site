# DK App Tools Website Design Plan

## Main goal

DK App Tools is an umbrella brand website, not a single-product landing page.

The website must support:
- multiple apps
- app categories
- shareable articles
- community feedback and polls
- individual product pages
- privacy/support pages
- future growth

Offline FileSecure is the first product, but it must not dominate the whole website.

## Core website sections

### Home

Home should work as a brand hub.

Required sections:
1. Hero for DK App Tools as a brand
2. Featured apps preview
3. Browse by category
4. Latest articles
5. Community poll / feedback preview
6. Why DK App Tools
7. Support / newsletter / contact CTA

Home must not feel like only Offline FileSecure is being advertised.

### Apps

Apps should work as a catalog.

Required structure:
1. Compact page intro
2. Category filters or category navigation
3. App cards with status badges
4. Each app card links to a product page
5. Future app slots should look intentional, not empty filler

App statuses may include:
- Available
- Coming soon
- In development
- Idea stage

### Categories

Categories should help users browse the ecosystem.

Initial categories:
- Privacy & Security
- File Tools
- Productivity
- Android Tools
- Future experiments

### Articles

Articles are important for marketing, SEO, and sharing.

Article types:
- practical guides
- privacy explanations
- product update notes
- behind-the-build posts
- comparisons and decision guides

The articles page must not be a dead placeholder forever.

### Community

Community should support:
- polls
- feedback
- future app idea voting
- suggested article topics

This can start simple, but it should feel like a planned part of the brand.

### Product pages

Each app gets its own page.

Each product page should include:
- product positioning
- key benefits
- privacy summary
- supported platform
- FAQ
- support link
- Play Store link when available
- related articles

## Visual direction

The design should feel:
- modern
- technological
- premium
- clean
- structured
- trustworthy
- software-focused

Avoid:
- fantasy / game server style
- old Lineage2 server look
- plain white news-site look
- giant empty headings with no layout
- random cards without hierarchy
- single-product landing page structure
- overusing Offline FileSecure on every section
- generic SaaS clichés without purpose

Preferred visual direction:
- dark or graphite base
- controlled contrast
- subtle tech texture or grid
- clean cards with strong hierarchy
- balanced spacing
- compact content density where needed
- clear sections with different visual roles
- modern sans-serif typography
- restrained accent color

Possible accent direction:
- graphite / near-black base
- electric blue or cyan accent
- muted gold only as a secondary brand accent
- avoid heavy bronze fantasy styling

## Layout principles

The site should use real layout architecture:
- hero should be compact and purposeful
- app catalog should look like a catalog, not a poster
- articles should look shareable
- categories should be browsable
- community should be visible
- footer should support discovery

Each page needs a different layout role:
- Home = overview hub
- Apps = catalog
- App page = product landing page
- Articles = content hub
- Community = feedback hub
- Support = contact/help page

## Development rule

Do not make large visual changes directly in code without a clear structure first.

Before coding:
1. define the section structure
2. define the layout behavior
3. define the visual role of each block
4. then implement in Astro/CSS

Build and check locally before committing.
