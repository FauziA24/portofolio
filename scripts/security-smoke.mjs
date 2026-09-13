const apiBase = process.env.API_BASE ?? "http://127.0.0.1:3001";

function url(path) {
  return new URL(path, apiBase).toString();
}

async function request(path, init) {
  const response = await fetch(url(path), { ...init, signal: AbortSignal.timeout(5000) });
  const text = await response.text();
  return { response, text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hasHeader(response, name, expected) {
  return response.headers.get(name)?.toLowerCase() === expected.toLowerCase();
}

async function main() {
  const checks = [];
  const check = async (name, fn) => {
    await fn();
    checks.push(name);
  };

  await check("health endpoint is alive and traceable", async () => {
    const { response, text } = await request("/health");
    const body = JSON.parse(text);
    assert(response.status === 200, `/health expected 200, got ${response.status}`);
    assert(body.status === "ok", "/health status must be ok");
    assert(typeof body.requestId === "string", "/health must include requestId");
    assert(typeof body.uptimeSeconds === "number", "/health must include uptimeSeconds");
  });

  await check("public API has cache and security headers", async () => {
    const { response } = await request("/api/projects");
    assert(response.status === 200, `/api/projects expected 200, got ${response.status}`);
    assert(response.headers.get("cache-control")?.includes("stale-while-revalidate"), "public API must be CDN cacheable");
    assert(hasHeader(response, "x-content-type-options", "nosniff"), "missing nosniff header");
    assert(hasHeader(response, "x-frame-options", "DENY"), "missing frame deny header");
    assert(hasHeader(response, "referrer-policy", "strict-origin-when-cross-origin"), "missing referrer policy");
  });

  await check("admin API blocks unauthenticated access and disables cache", async () => {
    const { response } = await request("/api/admin/projects");
    assert(response.status === 401, `/api/admin/projects expected 401, got ${response.status}`);
    assert(hasHeader(response, "cache-control", "no-store"), "admin API must not be cached");
  });

  await check("mutating admin endpoint requires auth", async () => {
    const { response } = await request("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteUrl: "https://example.com" })
    });
    assert(response.status === 401, `/api/admin/settings PUT expected 401, got ${response.status}`);
  });

  await check("login rate limit blocks repeated failures", async () => {
    const email = `security-${Date.now()}@example.com`;
    let lastStatus = 0;
    for (let i = 0; i < 6; i += 1) {
      const { response } = await request("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password: "wrong-password" })
      });
      lastStatus = response.status;
    }
    assert(lastStatus === 429, `sixth failed login expected 429, got ${lastStatus}`);
  });

  await check("sitemap and robots are cacheable", async () => {
    const sitemap = await request("/sitemap.xml");
    assert(sitemap.response.status === 200, `/sitemap.xml expected 200, got ${sitemap.response.status}`);
    assert(sitemap.text.includes("<urlset"), "sitemap must be XML urlset");
    assert(sitemap.response.headers.get("cache-control")?.includes("stale-while-revalidate"), "sitemap must be cacheable");

    const robots = await request("/robots.txt");
    assert(robots.response.status === 200, `/robots.txt expected 200, got ${robots.response.status}`);
    assert(robots.text.includes("User-agent: *"), "robots.txt must include user agent");
    assert(robots.response.headers.get("cache-control")?.includes("stale-while-revalidate"), "robots must be cacheable");
  });

  console.log(JSON.stringify({ status: "passed", apiBase, checks }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "failed", apiBase, error: error.message }, null, 2));
  process.exit(1);
});
