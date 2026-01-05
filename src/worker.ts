type Bindings = { ASSETS: { fetch: (req: Request) => Promise<Response> } };

export default {
  async fetch(request: Request, env: Bindings): Promise<Response> {
    const url = new URL(request.url);

    // Try to serve static asset first
    const res = await env.ASSETS.fetch(request);

    // SPA fallback: serve index.html for non-file GET routes returning 404
    const isGet = request.method === "GET";
    const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(url.pathname);

    if (res.status === 404 && isGet && !looksLikeFile) {
      const indexUrl = new URL("/index.html", url.origin);
      return env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return res;
  },
};