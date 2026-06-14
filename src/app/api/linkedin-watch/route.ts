// src/app/api/linkedin-watch/route.ts
import { NextResponse } from "next/server";
import { snapshotCompanies } from "@/scrapers/linkedin_prospects";

export const dynamic = "force-dynamic"; // always hit the live MCP, never cache

// Public company pages only (public business data). Point the person-profile path at your
// own prospect list; see src/scrapers/linkedin_prospects.ts.
const WATCHLIST = [
  "https://www.linkedin.com/company/stripe",
  "https://www.linkedin.com/company/bright-data",
];

export async function GET() {
  try {
    const companies = await snapshotCompanies(WATCHLIST);
    return NextResponse.json({ companies, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
