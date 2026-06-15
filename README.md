# LinkedIn account watch

Watches LinkedIn company pages for changes (followers, headcount, size band, and other fields) and shows them on a dashboard. This is the runnable version of **Use case 3** from the [brightdata-scrape Kiro Power](https://github.com/brightdata/kiro-powers) guide.

It fetches public company pages through Bright Data's [Web MCP server](https://brightdata.com/ai/mcp-server). The same code can fetch individual profiles too; point it at your own list.

## Run it

```bash
npm install
cp .env.example .env.local   # paste your Bright Data token into BRIGHTDATA_API_KEY
npm run dev                  # open http://localhost:3000
```

You need a Bright Data token with **Pro mode** on ([pricing](https://brightdata.com/pricing/mcp-server)); the `web_data_linkedin_*` tools aren't free. A company page returns in a few seconds.

Prefer the command line? Capture one page with:

```bash
node --env-file=.env.local scripts/run-linkedin.mjs web_data_linkedin_company_profile "https://www.linkedin.com/company/stripe"
```

## Good to know

- Your token stays local. `.env*` is gitignored, so it's never committed.
- The demo tracks public company pages on purpose. If you fetch individual profiles, follow LinkedIn's terms and applicable privacy rules.
