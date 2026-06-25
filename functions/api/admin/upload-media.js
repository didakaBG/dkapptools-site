const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ADMIN_HOST = "admin.dkapptools.com";
const ADMIN_ORIGIN = "https://admin.dkapptools.com";
const ALLOWED_MIME_TYPES = new Map([
  ["image/webp", "webp"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"]
]);

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: {
      "cache-control": "no-store"
    }
  });
}

function requireAdminRequest(request) {
  const url = new URL(request.url);

  if (url.hostname !== ADMIN_HOST) {
    return notFound();
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      message: "Only POST is allowed."
    });
  }

  const origin = request.headers.get("origin");

  if (origin !== ADMIN_ORIGIN) {
    return jsonResponse(403, {
      ok: false,
      message: "Invalid admin origin."
    });
  }

  return null;
}

function getEnv(context, name) {
  const value = context.env && context.env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function sanitizeSlug(value) {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid article slug.");
  }

  return slug;
}

function sanitizeFileBaseName(value) {
  const base = String(value || "image")
    .toLowerCase()
    .replace(/\.[^.]+$/u, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "image";
}

function normalizePurpose(value) {
  const purpose = String(value || "").toLowerCase();

  if (purpose === "card" || purpose === "main" || purpose === "inline") {
    return purpose;
  }

  throw new Error("Invalid image purpose.");
}

function readUInt24LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function readUInt32BE(bytes, offset) {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function readUInt16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUInt16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function ascii(bytes, offset, length) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function getPngDimensions(bytes) {
  const isPng =
    bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  if (!isPng) {
    return null;
  }

  return {
    width: readUInt32BE(bytes, 16),
    height: readUInt32BE(bytes, 20)
  };
}

function getJpegDimensions(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    if (offset + 2 > bytes.length) {
      break;
    }

    const length = readUInt16BE(bytes, offset);

    if (length < 2 || offset + length > bytes.length) {
      break;
    }

    const isSof =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;

    if (isSof && offset + 7 <= bytes.length) {
      return {
        height: readUInt16BE(bytes, offset + 3),
        width: readUInt16BE(bytes, offset + 5)
      };
    }

    offset += length;
  }

  return null;
}

function getWebpDimensions(bytes) {
  if (
    bytes.length < 30 ||
    ascii(bytes, 0, 4) !== "RIFF" ||
    ascii(bytes, 8, 4) !== "WEBP"
  ) {
    return null;
  }

  const chunk = ascii(bytes, 12, 4);

  if (chunk === "VP8X" && bytes.length >= 30) {
    return {
      width: readUInt24LE(bytes, 24) + 1,
      height: readUInt24LE(bytes, 27) + 1
    };
  }

  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    const b1 = bytes[21];
    const b2 = bytes[22];
    const b3 = bytes[23];
    const b4 = bytes[24];

    return {
      width: 1 + (((b2 & 0x3f) << 8) | b1),
      height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6))
    };
  }

  if (chunk === "VP8 " && bytes.length >= 30) {
    return {
      width: readUInt16LE(bytes, 26) & 0x3fff,
      height: readUInt16LE(bytes, 28) & 0x3fff
    };
  }

  return null;
}

function getImageDimensions(bytes, mimeType) {
  if (mimeType === "image/png") {
    return getPngDimensions(bytes);
  }

  if (mimeType === "image/jpeg") {
    return getJpegDimensions(bytes);
  }

  if (mimeType === "image/webp") {
    return getWebpDimensions(bytes);
  }

  return null;
}

function validateDimensions(dimensions, purpose) {
  if (!dimensions || !dimensions.width || !dimensions.height) {
    throw new Error("Image dimensions could not be read.");
  }

  if (purpose === "card") {
    if (dimensions.width < 800 || dimensions.height < 450) {
      throw new Error("Card image must be at least 800x450 px.");
    }

    const ratio = dimensions.width / dimensions.height;

    if (ratio < 1.68 || ratio > 1.86) {
      throw new Error("Card image should be close to 16:9.");
    }
  }

  if (purpose === "main") {
    if (dimensions.width < 1200 || dimensions.height < 675) {
      throw new Error("Article main image must be at least 1200x675 px.");
    }
  }

  if (purpose === "inline") {
    return;
  }
}

function toBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function encodeRepoPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function githubRequest(context, method, repoPath, body) {
  const token = getEnv(context, "GITHUB_TOKEN");
  const owner = getEnv(context, "GITHUB_OWNER");
  const repo = getEnv(context, "GITHUB_REPO");
  const branch = getEnv(context, "GITHUB_BRANCH");

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeRepoPath(repoPath)}`;

  const response = await fetch(url, {
    method,
    headers: {
      "accept": "application/vnd.github+json",
      "authorization": `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "dkapptools-admin",
      "x-github-api-version": "2022-11-28"
    },
    body: body
      ? JSON.stringify({
          ...body,
          branch
        })
      : undefined
  });

  return response;
}

async function getExistingSha(context, repoPath) {
  const response = await githubRequest(context, "GET", repoPath);

  if (response.status === 404) {
    return null;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Could not read existing media file.");
  }

  return payload.sha || null;
}

async function uploadToGithub(context, repoPath, bytes, message) {
  const sha = await getExistingSha(context, repoPath);
  const body = {
    message,
    content: toBase64(bytes)
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await githubRequest(context, "PUT", repoPath, body);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Could not upload media file.");
  }

  return payload;
}

export async function onRequest(context) {
  try {
    const blocked = requireAdminRequest(context.request);

    if (blocked) {
      return blocked;
    }

    const form = await context.request.formData();
    const file = form.get("file");
    const articleSlug = sanitizeSlug(form.get("articleSlug"));
    const purpose = normalizePurpose(form.get("purpose"));
    const fileNameInput = sanitizeFileBaseName(file && file.name ? file.name : "image");

    if (!file || typeof file.arrayBuffer !== "function") {
      return jsonResponse(400, {
        ok: false,
        message: "Missing image file."
      });
    }

    const mimeType = String(file.type || "").toLowerCase();
    const extension = ALLOWED_MIME_TYPES.get(mimeType);

    if (!extension) {
      return jsonResponse(400, {
        ok: false,
        message: "Use WebP, JPG, or PNG image files."
      });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return jsonResponse(400, {
        ok: false,
        message: "Image file is too large. Keep it under 2 MB."
      });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const dimensions = getImageDimensions(bytes, mimeType);
    validateDimensions(dimensions, purpose);

    const finalFileName = `${purpose}-${fileNameInput}.${extension}`;
    const repoPath = `src/assets/img/articles/${articleSlug}/${finalFileName}`;
    const publicPath = `/assets/img/articles/${articleSlug}/${finalFileName}`;

    await uploadToGithub(
      context,
      repoPath,
      bytes,
      `Upload media: ${publicPath}`
    );

    return jsonResponse(200, {
      ok: true,
      path: publicPath,
      width: dimensions.width,
      height: dimensions.height,
      sizeBytes: bytes.length
    });
  } catch (error) {
    const message = error && error.message ? error.message : "Media upload failed.";

    return jsonResponse(400, {
      ok: false,
      message
    });
  }
}
