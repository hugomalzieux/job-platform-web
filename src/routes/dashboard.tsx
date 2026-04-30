import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dashboardApi } from "../lib/api/dashboard.js";
import { formatDistanceToNow } from "date-fns";

export function DashboardPage() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => dashboardApi.summary() });

  if (q.isLoading) return <div className="text-sm text-zinc-600">Loading…</div>;
  if (q.isError) return <div className="text-sm text-red-600">Failed to load dashboard</div>;

  const d = q.data;
  if (!d) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Daily triage snapshot</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="New offers" value={d.counts.newOffers} to="/offers?tab=new" />
        <MetricCard label="Kept" value={d.counts.keptOffers} to="/offers?tab=kept" />
        <MetricCard label="Dismissed" value={d.counts.dismissedOffers} to="/offers?tab=dismissed" />
        <MetricCard label="Failed runs" value={d.counts.failedRuns} to="/runs?status=failed" />
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">New offers</h2>
            <Link to="/offers?tab=new" className="text-sm font-medium text-zinc-900 underline">
              Open inbox
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {d.newOffersPreview.length === 0 ? (
              <div className="p-4 text-sm text-zinc-600">No new offers</div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {d.newOffersPreview.map((o) => (
                  <li key={o.id} className="p-3">
                    <Link to={`/offers/${o.id}`} className="font-medium text-zinc-900 hover:underline">
                      {o.title}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-600">
                      {o.company ?? "—"} · {formatDistanceToNow(new Date(o.firstSeenAt), { addSuffix: true })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Recent runs</h2>
            <Link to="/runs" className="text-sm font-medium text-zinc-900 underline">
              All runs
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            {d.recentRuns.length === 0 ? (
              <div className="p-4 text-sm text-zinc-600">No runs yet</div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {d.recentRuns.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <Link to={`/runs/${r.id}`} className="font-mono text-xs text-zinc-900 hover:underline">
                        {r.id.slice(0, 8)}…
                      </Link>
                      <div className="mt-1 text-xs text-zinc-600">
                        {r.status} · {formatDistanceToNow(new Date(r.startedAt), { addSuffix: true })}
                      </div>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize text-zinc-700">
                      +{r.offersNew}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard(props: { label: string; value: number; to: string }) {
  return (
    <Link
      to={props.to}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300"
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{props.label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{props.value}</div>
    </Link>
  );
}
