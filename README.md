# LinkedIn account watch (Bright Data Web MCP demo)

A minimal, runnable Next.js app that tracks LinkedIn entities via Bright Data's
`web_data_linkedin_*` Pro tools over the [Web MCP server](https://brightdata.com/ai/mcp-server).
It's the runnable version of **Use case 3** from the brightdata-scrape Kiro Power article.

The live dashboard watches **public company pages** (`web_data_linkedin_company_profile`) — public
business data, the same risk class as the Crunchbase build. The individual-prospect path
(`web_data_linkedin_person_profile`) is the same client and pattern; you point it at your own
prospect list. The demo deliberately does not scrape private individuals.

## What's inside

| File | Role |
|------|------|
| `src/lib/mcp-client.ts` | Thin MCP **Streamable HTTP** client (`callMcpTool`): `initialize` → session header → `notifications/initialized` → `tools/call`, with SSE parsing. The same client works for any `web_data_*` tool. |
| `src/scrapers/linkedin_prospects.ts` | `snapshotProspect` / `diffProspect` (person profiles) + `snapshotCompany` / `snapshotCompanies` (company pages, the live demo). |
| `src/app/api/linkedin-watch/route.ts` | API route; calls the company watch-list live. |
| `src/app/page.tsx` | Dashboard that fetches the route on mount. |
| `scripts/run-linkedin.mjs` | Standalone live-capture script (no build step). |

## Prerequisites

- A **Bright Data** account with **Pro mode** ([pricing](https://brightdata.com/pricing/mcp-server)) — the `web_data_linkedin_*` tools are **not** in the free tier.
- Node 20+.

## Run it

```bash
npm install
cp .env.example .env.local      # then paste your token into BRIGHTDATA_API_KEY
npm run dev                     # http://localhost:3000
```

The MCP URL hardcodes `&pro=1` (in `src/lib/mcp-client.ts`) — that's what exposes the Pro
`web_data_linkedin_*` tools. A live company-profile scrape returns in a few seconds.

To capture the raw response shape without the UI:

```bash
node --env-file=.env.local scripts/run-linkedin.mjs web_data_linkedin_company_profile "https://www.linkedin.com/company/stripe"
```

## Notes

- **Don't commit your token.** `.env*` is gitignored.
- The dashboard tracks public company pages on purpose. If you point the person-profile path
  at individuals, confirm your use complies with LinkedIn's terms and applicable privacy law,
  and prefer official APIs where available.
- `diffProspect` is a pure function: store one snapshot per (entity × day) and diff
  consecutive runs to alert on job changes, company moves, or promotions.
