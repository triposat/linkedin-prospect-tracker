// scripts/run-linkedin.mjs — live capture / smoke test for the LinkedIn social-group tools.
// Run: node --env-file=.env.local scripts/run-linkedin.mjs [tool] [url]
//   tool defaults to web_data_linkedin_company_profile (public company page = safe).
//   For an individual prospect, pass web_data_linkedin_person_profile + a profile URL.
const MCP_URL = `https://mcp.brightdata.com/mcp?token=${process.env.BRIGHTDATA_API_KEY}&pro=1`;

async function post(body, sessionId) {
  const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
  if (sessionId) headers["mcp-session-id"] = sessionId;
  return fetch(MCP_URL, { method: "POST", headers, body: JSON.stringify(body) });
}

function parseSse(text) {
  if (!text.includes("data:")) {
    try { return [JSON.parse(text)]; } catch { throw new Error(`non-JSON response: ${text.slice(0, 160)}`); }
  }
  return text
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => { try { return JSON.parse(l.slice(5).trim()); } catch { return null; } })
    .filter(Boolean);
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`client-side timeout after ${(ms / 1000).toFixed(0)}s (${label})`)), ms)),
  ]);
}

async function callMcpTool(name, args) {
  const init = await post({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "linkedin", version: "1.0" } },
  });
  if (!init.ok) throw new Error(`initialize HTTP ${init.status} ${init.statusText}. Check BRIGHTDATA_API_KEY.`);
  const sessionId = init.headers.get("mcp-session-id") ?? undefined;
  await init.text();
  await post({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }, sessionId);
  const res = await post({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name, arguments: args } }, sessionId);
  if (!res.ok) throw new Error(`tools/call HTTP ${res.status} ${res.statusText}.`);
  const reply = parseSse(await res.text()).find((m) => m?.id === 2);
  if (reply?.error) throw new Error(`MCP error: ${reply.error.message}`);
  const t = reply?.result?.content?.find((c) => c.type === "text")?.text;
  const payload = t ? JSON.parse(t) : reply?.result;
  return Array.isArray(payload) ? payload[0] : payload;
}

if (!process.env.BRIGHTDATA_API_KEY) {
  console.error("BRIGHTDATA_API_KEY not set. Run: node --env-file=.env.local scripts/run-linkedin.mjs");
  process.exit(1);
}

const tool = process.argv[2] ?? "web_data_linkedin_company_profile";
const url = process.argv[3] ?? "https://www.linkedin.com/company/stripe";
const t0 = Date.now();
try {
  const row = await withTimeout(callMcpTool(tool, { url }), 150000, tool);
  console.log(`OK ${tool} — ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`returned keys: ${Object.keys(row ?? {}).join(", ") || "(none)"}`);
  console.log(JSON.stringify(row, null, 2).slice(0, 1600));
} catch (e) {
  console.log(`FAIL ${tool} — ${((Date.now() - t0) / 1000).toFixed(1)}s: ${e.message ?? e}`);
}
process.exit(0);
