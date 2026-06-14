"use client";
import { useEffect, useState } from "react";

interface CompanySnapshot {
  url: string;
  name: string;
  followers: number;
  employees_in_linkedin: number;
  company_size: string;
  industries: string;
  headquarters: string;
}

export default function Home() {
  const [companies, setCompanies] = useState<CompanySnapshot[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/linkedin-watch")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else { setCompanies(d.companies); setFetchedAt(d.fetchedAt); }
      })
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">LinkedIn account watch</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live from Bright Data <code>web_data_linkedin_company_profile</code> via the Web MCP server
          {fetchedAt && <> · fetched {new Date(fetchedAt).toLocaleString()}</>}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Demo tracks public company pages. The same client calls{" "}
          <code>web_data_linkedin_person_profile</code> for individual prospects.
        </p>

        {error && <div className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700">Error: {error}</div>}
        {!companies && !error && <div className="mt-6 text-slate-500">Scraping live…</div>}

        <div className="mt-6 grid gap-4">
          {companies?.map((c) => (
            <div key={c.url} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{c.name}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{c.company_size || "—"}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <Stat label="Followers" value={c.followers ? c.followers.toLocaleString() : ""} />
                <Stat label="Employees on LinkedIn" value={c.employees_in_linkedin ? c.employees_in_linkedin.toLocaleString() : ""} />
                <Stat label="Headquarters" value={c.headquarters} />
                <Stat label="Industries" value={c.industries} />
              </dl>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
