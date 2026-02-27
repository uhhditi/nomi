#!/usr/bin/env node
/**
 * Check that the API is reachable (local and/or Vercel).
 * Usage:
 *   npm run check-connection
 *   API_URL=https://your-app.vercel.app npm run check-connection
 */

const LOCAL = "http://localhost:3000";
const API_URL = process.env.API_URL
  ? process.env.API_URL.replace(/\/$/, "")
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`
    : null;

async function check(url, label) {
  const base = url.replace(/\/$/, "");
  const healthUrl = `${base}/health`;
  try {
    const res = await fetch(healthUrl);
    const body = await res.text();
    const ok = res.ok && (body === '{"ok":true}' || body.includes('"ok":true'));
    console.log(ok ? `✓ ${label}: ${healthUrl} → 200 OK` : `✗ ${label}: ${healthUrl} → ${res.status} ${body}`);
    return ok;
  } catch (err) {
    console.log(`✗ ${label}: ${healthUrl} → ${err.message}`);
    return false;
  }
}

(async () => {
  let anyOk = false;
  anyOk = (await check(LOCAL, "Local")) || anyOk;
  if (API_URL) anyOk = (await check(API_URL, "Vercel")) || anyOk;
  process.exit(anyOk ? 0 : 1);
})();
