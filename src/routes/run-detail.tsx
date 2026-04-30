import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { runsApi } from "../lib/api/runs.js";

export function RunDetailPage() {
  const { runId } = useParams();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["run", runId],
    enabled: Boolean(runId),
    queryFn: () => runsApi.get(runId!),
  });

  const retry = useMutation({
    mutationFn: () => runsApi.retry(runId!),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["runs"] });
      await qc.invalidateQueries({ queryKey: ["run", runId] });
    },
  });

  if (!runId) return null;
  if (q.isLoading) return <div className="text-sm text-zinc-600">Loading…</div>;
  if (q.isError || !q.data) return <div className="text-sm text-red-600">Run not found</div>;

  const run = q.data.run;
  const logsText =
    typeof run.logJson === "string"
      ? run.logJson
      : JSON.stringify(run.logJson, null, 2);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/runs" className="text-sm text-zinc-600 hover:underline">
            ← Runs
          </Link>
          <h1 className="mt-2 font-mono text-lg font-semibold">{run.id}</h1>
          <div className="mt-2 text-sm text-zinc-700">
            Status: <span className="capitalize">{run.status}</span>
          </div>
          <div className="mt-2 text-sm text-zinc-700">
            Offers — found {run.offersFound}, new {run.offersNew}, updated {run.offersUpdated}
          </div>
          {run.errorMessage ? <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{run.errorMessage}</div> : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={retry.isPending || run.status === "running" || run.status === "queued"}
            onClick={() => void retry.mutateAsync()}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Retry (enqueue new run)
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Logs</h2>
        <pre className="mt-3 max-h-[480px] overflow-auto whitespace-pre-wrap font-mono text-xs text-zinc-800">{logsText}</pre>
      </section>
    </div>
  );
}
