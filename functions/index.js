const ADMIN_HOST = "admin.dkapptools.com";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  if (host === ADMIN_HOST) {
    const adminUrl = new URL(context.request.url);
    adminUrl.pathname = "/_admin/";
    adminUrl.search = "";

    return context.env.ASSETS.fetch(
      new Request(adminUrl.toString(), context.request)
    );
  }

  return context.env.ASSETS.fetch(context.request);
}
