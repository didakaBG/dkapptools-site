const ADMIN_HOST = "admin.dkapptools.com";

function pausedAdminResponse() {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DK App Tools Admin</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0d0f12;
      --panel: rgba(27, 30, 36, 0.92);
      --border: rgba(214, 167, 74, 0.28);
      --text: #f4efe4;
      --muted: #b9b0a1;
      --gold: #d6a74a;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 20% 20%, rgba(214, 167, 74, 0.12), transparent 28%),
        radial-gradient(circle at 80% 80%, rgba(214, 167, 74, 0.08), transparent 30%),
        var(--bg);
      color: var(--text);
    }

    main {
      width: min(720px, 100%);
      padding: 32px;
      border: 1px solid var(--border);
      border-radius: 24px;
      background: var(--panel);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
    }

    .badge {
      display: inline-flex;
      margin-bottom: 18px;
      color: var(--gold);
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(2rem, 5vw, 3.1rem);
      line-height: 1.05;
    }

    p {
      margin: 0;
      color: var(--muted);
      font-size: 1.05rem;
      line-height: 1.7;
    }

    a {
      display: inline-flex;
      margin-top: 24px;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--text);
      text-decoration: none;
      font-weight: 800;
      background: rgba(214, 167, 74, 0.08);
    }
  </style>
</head>
<body>
  <main>
    <div class="badge">DK App Tools Admin</div>
    <h1>Admin panel is paused</h1>
    <p>Articles are managed manually through the project repository for now. The public website remains active.</p>
    <a href="https://dkapptools.com/">Open public website</a>
  </main>
</body>
</html>`, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  if (host === ADMIN_HOST) {
    return pausedAdminResponse();
  }

  return context.env.ASSETS.fetch(context.request);
}
