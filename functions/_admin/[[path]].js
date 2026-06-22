const ADMIN_HOST = "admin.dkapptools.com";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  if (host === ADMIN_HOST) {
    url.pathname = "/";
    url.search = "";
    return Response.redirect(url.toString(), 302);
  }

  return new Response("Not found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=UTF-8",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}
