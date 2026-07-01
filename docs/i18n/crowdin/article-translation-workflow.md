# Article Translation Workflow

Article translations for DK App Tools must be prepared and reviewed through Crowdin before they are applied to public pages.

## Source files

- English article source strings live in `docs/i18n/crowdin/dkapptools-articles.en.json`.
- Bulgarian draft/template strings live in `docs/i18n/crowdin/dkapptools-articles.bg.draft.json`.
- Do not directly translate `src/articles/*.md` into Bulgarian article pages.
- Do not create `src/bg/articles/...` article pages until reviewed translations are available.

## Review requirements

- Codex should not directly translate article pages.
- Preserve conservative security and privacy wording.
- Keep product and platform names in English where appropriate:
  - DK App Tools
  - Offline FileSecure
  - Android
  - Google Play
  - Vault PIN
- Avoid stronger claims than the English source.

## Avoid overclaims

Do not add phrases or ideas such as:

- unbreakable
- military grade
- no trace
- impossible to access
- guaranteed protection
- 100% safe

## Product availability

Do not add download links, Google Play CTAs, or install prompts until the app is publicly available.
