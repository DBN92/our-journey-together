type Bindings = { ASSETS?: { fetch: (req: Request) => Promise<Response> } };

export default {
  async fetch(request: Request, env: Bindings): Promise<Response> {
    const url = new URL(request.url);

    // Try to serve static asset first (guard if binding is missing)
    if (!env.ASSETS) {
      // No assets binding available; return index.html fallback for SPA routes
      const url = new URL(request.url);
      const isGet = request.method === "GET";
      const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(url.pathname);
      if (isGet && !looksLikeFile) {
        return new Response("", { status: 200, headers: { "Content-Type": "text/html" } });
      }
      return new Response("Not Found", { status: 404 });
    }

    const res = await env.ASSETS.fetch(request);

    // SPA fallback: serve index.html for non-file GET routes returning 404
    const isGet = request.method === "GET";
    const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(url.pathname);

    if (res.status === 404 && isGet && !looksLikeFile) {
      const indexUrl = new URL("/index.html", url.origin);
      return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
    }

    return res;
  },
};