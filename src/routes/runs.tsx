import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { runsApi } from "../lib/api/runs.js";

export function RunsPage() {
  const [params] = useSearchParams();
  const status = params.get("status") ?? undefined;

  const q = useQuery({
    queryKey: ["runs", status],
    queryFn: () => runsApi.list({ status }),
  });

  if (q.isLoading) return <div className="text-sm text-zinc-600">Loading…</div>;
  if (q.isError) return <div className="text-sm text-red-600">Failed to load runs</div>;

  const items = q.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Crawl runs</h1>
        <p className="mt-1 text-sm text-zinc-600">Execution history</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-3 py-2">Run</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Started</th>
              <th className="px-3 py-2">Found</th>
              <th className="px-3 py-2">New</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-600" colSpan={5}>
                  No runs
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <td className="px-3 py-2">
                    <Link className="font-mono text-xs hover:underline" to={`/runs/${r.id}`}>
                      {r.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-3 py-2 capitalize">{r.status}</td>
                  <td className="px-3 py-2 text-xs text-zinc-700">{new Date(r.startedAt).toLocaleString()}</td>
                  <td className="px-3 py-2 tabular-nums">{r.offersFound}</td>
                  <td className="px-3 py-2 tabular-nums">{r.offersNew}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
