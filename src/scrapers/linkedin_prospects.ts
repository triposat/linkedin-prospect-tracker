// src/scrapers/linkedin_prospects.ts
// LinkedIn lead-gen / account intel over the Web MCP social group.
// The person fields are verified against web_data_linkedin_person_profile; the live demo
// (the API route) runs web_data_linkedin_company_profile against public company pages, so
// the dashboard never scrapes a private individual. The two paths share one client.
import { callMcpTool } from "@/lib/mcp-client";

// ---- Individual prospects: web_data_linkedin_person_profile ----
// Point this at your own prospect list. One MCP call per URL; diff today vs. yesterday.
export interface ProspectSnapshot {
  url: string;
  current_company_name: string; // current_company is a nested object; *_name is the string
  position: string;             // job-title field; there is no "current_title"
  location: string;
  followers: number;
}

export type Change = { field: string; from: string; to: string };

export const snapshotProspect = (url: string) =>
  callMcpTool<ProspectSnapshot>("web_data_linkedin_person_profile", { url });

// Diff today vs. yesterday; emit a Change for any field that moved.
export function diffProspect(prev: ProspectSnapshot, now: ProspectSnapshot): Change[] {
  return (["current_company_name", "position"] as const)
    .filter((f) => prev[f] !== now[f])
    .map((f) => ({ field: f, from: prev[f], to: now[f] }));
}

// ---- Company watch: web_data_linkedin_company_profile (the safe, public-data demo) ----
// "Company moves" is one of the prospect signals, so the company page is on-topic and
// carries no individual-privacy concern, the same as the Crunchbase build.
export interface CompanySnapshot {
  url: string;
  name: string;
  followers: number;
  employees_in_linkedin: number;
  company_size: string;
  industries: string;
  headquarters: string;
}

export async function snapshotCompany(url: string): Promise<CompanySnapshot> {
  const row = await callMcpTool<Record<string, unknown>>("web_data_linkedin_company_profile", { url });
  return {
    url,
    name: String(row.name ?? ""),
    followers: Number(row.followers ?? 0),
    employees_in_linkedin: Number(row.employees_in_linkedin ?? 0),
    company_size: String(row.company_size ?? ""),
    industries: Array.isArray(row.industries) ? row.industries.join(", ") : String(row.industries ?? ""),
    headquarters: String(row.headquarters ?? ""),
  };
}

export async function snapshotCompanies(urls: string[]): Promise<CompanySnapshot[]> {
  // errors isolated per-URL so one bad page doesn't sink the batch
  const results = await Promise.allSettled(urls.map((u) => snapshotCompany(u)));
  return results
    .filter((r): r is PromiseFulfilledResult<CompanySnapshot> => r.status === "fulfilled")
    .map((r) => r.value);
}
