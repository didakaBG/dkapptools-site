const ADMIN_HOST = "admin.dkapptools.com";
const GITHUB_API_VERSION = "2022-11-28";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}

function notFoundResponse() {
  return new Response("Not found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=UTF-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function getRequiredEnv(env, name) {
  const value = env[name];

  if (!value || typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${name}`);
  }

  return value.trim();
}

function normalizeArticlePath(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value.replace(/\\/g, "/").trim();
}

function isAllowedArticlePath(path) {
  return /^src\/articles\/[a-z0-9-]+\.md$/.test(path);
}

async function readJsonRequest(request) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function githubRequest({ url, method, token, body }) {
  const response = await fetch(url, {
    method,
    headers: {
      "accept": "application/vnd.github+json",
      "authorization": `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "dkapptools-admin",
      "x-github-api-version": GITHUB_API_VERSION
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  return { response, data };
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();

  if (host !== ADMIN_HOST) {
    return notFoundResponse();
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, message: "Method not allowed." }, 405);
  }

  const origin = request.headers.get("origin");

  if (origin !== `https://${ADMIN_HOST}`) {
    return jsonResponse({ ok: false, message: "Invalid request origin." }, 403);
  }

  const payload = await readJsonRequest(request);

  if (!payload) {
    return jsonResponse({ ok: false, message: "Invalid JSON request." }, 400);
  }

  const articlePath = normalizeArticlePath(payload.articlePath);
  const articleContent = typeof payload.content === "string" ? payload.content : "";
  const commitMessage =
    typeof payload.commitMessage === "string" && payload.commitMessage.trim()
      ? payload.commitMessage.trim()
      : "Update article from admin";

  if (!isAllowedArticlePath(articlePath)) {
    return jsonResponse({ ok: false, message: "Article path is not allowed." }, 400);
  }

  if (!articleContent.startsWith("---\n") && !articleContent.startsWith("---\r\n")) {
    return jsonResponse({ ok: false, message: "Article content must include front matter." }, 400);
  }

  if (articleContent.length > 250000) {
    return jsonResponse({ ok: false, message: "Article content is too large." }, 400);
  }

  let token;
  let owner;
  let repo;
  let branch;

  try {
    token = getRequiredEnv(env, "GITHUB_TOKEN");
    owner = getRequiredEnv(env, "GITHUB_OWNER");
    repo = getRequiredEnv(env, "GITHUB_REPO");
    branch = getRequiredEnv(env, "GITHUB_BRANCH");
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message }, 500);
  }

  const encodedPath = articlePath.split("/").map(encodeURIComponent).join("/");
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
  const readUrl = `${baseUrl}?ref=${encodeURIComponent(branch)}`;

  const existing = await githubRequest({
    url: readUrl,
    method: "GET",
    token
  });

  if (!existing.response.ok) {
    return jsonResponse({
      ok: false,
      message: "Could not read existing article from GitHub.",
      status: existing.response.status
    }, 502);
  }

  const sha = existing.data && existing.data.sha;

  if (!sha) {
    return jsonResponse({ ok: false, message: "Existing article SHA was not found." }, 502);
  }

  const update = await githubRequest({
    url: baseUrl,
    method: "PUT",
    token,
    body: {
      message: commitMessage,
      content: encodeBase64Utf8(articleContent),
      sha,
      branch
    }
  });

  if (!update.response.ok) {
    return jsonResponse({
      ok: false,
      message: "Could not save article to GitHub.",
      status: update.response.status,
      detail: update.data && update.data.message ? update.data.message : "Unknown GitHub error."
    }, 502);
  }

  return jsonResponse({
    ok: true,
    message: "Article saved.",
    path: articlePath,
    commit: update.data && update.data.commit ? update.data.commit.sha : null
  });
}
