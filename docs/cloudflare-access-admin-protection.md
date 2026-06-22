# DK App Tools Cloudflare Access Admin Protection

## Status

Cloudflare Access protection has been configured for the future DK App Tools admin area.

Protected hostname:

- `admin.dkapptools.com`

Cloudflare Pages custom domain:

- `admin.dkapptools.com`
- points to the DK App Tools Pages project

Cloudflare Zero Trust / Access application:

- application name: `admin`
- destination: `admin.dkapptools.com`
- type: self-hosted
- session duration: 24 hours

Access policy:

- policy name: `Only DK Admin`
- action: `Allow`
- include selector: `Emails`
- allowed email: `Didakaspy11@gmail.com`

## Verified Behavior

Opening:

- `https://admin.dkapptools.com`

now shows Cloudflare Access login/check before the site is loaded.

This confirms that the admin hostname is no longer just a public Pages mirror.

After successful Cloudflare Access login, the allowed admin user can reach the protected hostname.

## Security Decision

The DK App Tools admin panel must not use a public website password form.

The correct model is:

1. Cloudflare Access protects `admin.dkapptools.com`.
2. Only approved email accounts can pass the Access gate.
3. The Bulgarian admin UI loads only after Cloudflare Access allows the request.
4. Real write actions must still go through a protected server-side backend.
5. GitHub tokens or write credentials must never be exposed in public JavaScript.

## Current Public Admin State

The public `/admin/` route was removed from the static site source.

Current safe state:

- no public `/admin/` route
- no public admin login form
- no public editor UI
- no public Publish button
- no GitHub token in browser
- no write backend exposed

## Future Admin UI Rule

It is safe to work on the Bulgarian admin UI only after the Cloudflare Access protection remains active for `admin.dkapptools.com`.

Early admin UI may be visual/mock-only.

Until the protected backend exists, the UI must not perform real write operations.

Allowed early UI features:

- Bulgarian dashboard shell
- article metadata form mock
- structured block editor mock
- card preview mock
- article preview mock
- disabled Save Draft button
- disabled Publish button
- clear "backend not connected yet" state

Not allowed yet:

- real Save Draft
- real Publish
- image upload with write behavior
- maintenance mode writes
- GitHub token in browser
- public editor route

## Next Safe Implementation Step

The next admin implementation phase may add a Bulgarian admin UI behind `admin.dkapptools.com`.

The first UI version should be mock/read-only and must clearly avoid real write behavior until the server-side backend is implemented.
