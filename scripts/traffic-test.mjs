import { performance } from "node:perf_hooks";

const apiBase = process.env.API_BASE ?? "http://127.0.0.1:3001";
const webBase = process.env.WEB_BASE ?? "http://127.0.0.1:4173";
const total = Number(process.env.TRAFFIC_TOTAL ?? 500);
const concurrency = Number(process.env.TRAFFIC_CONCURRENCY ?? 50);
const timeoutMs = Number(process.env.TRAFFIC_TIMEOUT_MS ?? 5000);

const targets = [
  [apiBase, "/health"],
  [apiBase, "/api/profile"],
  [apiBase, "/api/profile/facts"],
  [apiBase, "/api/projects"],
  [apiBase, "/api/projects/featured"],
  [apiBase, "/api/research"],
  [apiBase, "/api/contact-links"],
  [apiBase, "/sitemap.xml"],
  [apiBase, "/robots.txt"],
  [webBase, "/"],
  [webBase, "/projects"]
];

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
}

async function hit(index) {
  const [base, path] = targets[index % targets.length];
  const target = new URL(path, base).toString();
  const started = performance.now();
  try {
    const response = await fetch(target, { signal: AbortSignal.timeout(timeoutMs) });
    await response.arrayBuffer();
    return { ok: response.status < 500, status: response.status, ms: performance.now() - started, target };
  } catch (error) {
    return { ok: false, status: "ERR", ms: performance.now() - started, target, error: error.message };
  }
}

async function main() {
  const results = [];
  let next = 0;
  const started = performance.now();

  async function worker() {
    while (next < total) {
      const index = next;
      next += 1;
      results.push(await hit(index));
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  const durationSeconds = (performance.now() - started) / 1000;
  const failures = results.filter((result) => !result.ok);
  const latencies = results.map((result) => result.ms);
  const byStatus = Object.fromEntries([...new Set(results.map((result) => String(result.status)))]
    .sort()
    .map((status) => [status, results.filter((result) => String(result.status) === status).length]));
  const byTarget = Object.fromEntries(targets.map(([base, path]) => {
    const url = new URL(path, base).toString();
    const rows = results.filter((result) => result.target === url);
    const targetLatencies = rows.map((result) => result.ms);
    return [url, {
      count: rows.length,
      failures: rows.filter((result) => !result.ok).length,
      p95Ms: Math.round(percentile(targetLatencies, 0.95))
    }];
  }));
  const report = {
    status: failures.length / results.length > 0.01 || percentile(latencies, 0.95) > 2000 ? "failed" : "passed",
    total,
    concurrency,
    durationSeconds: Number(durationSeconds.toFixed(2)),
    requestsPerSecond: Number((results.length / durationSeconds).toFixed(2)),
    failures: failures.length,
    byStatus,
    latencyMs: {
      min: Math.round(Math.min(...latencies)),
      p50: Math.round(percentile(latencies, 0.50)),
      p95: Math.round(percentile(latencies, 0.95)),
      p99: Math.round(percentile(latencies, 0.99)),
      max: Math.round(Math.max(...latencies))
    },
    byTarget
  };

  console.log(JSON.stringify(report, null, 2));
  if (report.status !== "passed") process.exit(1);
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "failed", error: error.message }, null, 2));
  process.exit(1);
});
