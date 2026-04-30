import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sourcesApi } from "../lib/api/sources.js";

export function SourcesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["sources"], queryFn: () => sourcesApi.list() });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => q.data?.items.find((s) => s.id === selectedId) ?? null, [q.data?.items, selectedId]);

  const [draftName, setDraftName] = useState("");
  const [draftEnabled, setDraftEnabled] = useState(true);
  const [draftJson, setDraftJson] = useState("{}");

  useEffect(() => {
    if (!selected) return;
    setDraftName(selected.name);
    setDraftEnabled(selected.isEnabled);
    setDraftJson(JSON.stringify(selected.configJson ?? {}, null, 2));
  }, [selected]);

  useEffect(() => {
    if (!q.data || selectedId) return;
    const first = q.data.items[0]?.id;
    if (first) setSelectedId(first);
  }, [q.data, selectedId]);

  const patch = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("No source");
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(draftJson) as Record<string, unknown>;
      } catch {
        throw new Error("Invalid JSON");
      }
      return sourcesApi.patch(selected.id, {
        name: draftName,
        isEnabled: draftEnabled,
        configJson: parsed,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["sources"] });
    },
  });

  const test = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("No source");
      return sourcesApi.test(selected.id);
    },
  });

  if (q.isLoading) return <div className="text-sm text-zinc-600">Loading…</div>;
  if (q.isError) return <div className="text-sm text-red-600">Failed to load sources</div>;

  const items = q.data?.items ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Sources</h1>
          <p className="mt-1 text-sm text-zinc-600">Connector configs isolated per source</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <ul className="divide-y divide-zinc-100">
            {items.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-zinc-50 ${
                    selectedId === s.id ? "bg-zinc-50" : ""
                  }`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{s.name}</span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs">{s.key}</span>
                      {!s.isEnabled ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">disabled</span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600">
                      Last success: {s.lastSuccessAt ? new Date(s.lastSuccessAt).toLocaleString() : "—"}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {!selected ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
            Select a source
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={test.isPending}
                onClick={() => void test.mutateAsync()}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
              >
                Test connector (dry parse)
              </button>
              <button
                type="button"
                disabled={patch.isPending}
                onClick={() => void patch.mutateAsync()}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                Save
              </button>
            </div>

            {test.data ? (
              <div className="rounded-md bg-zinc-50 p-3 text-sm">
                <div className="font-medium">{test.data.ok ? "OK" : "Failed"}</div>
                <div className="mt-1 text-xs text-zinc-700">Items parsed: {test.data.itemCount}</div>
                {test.data.error ? <div className="mt-2 text-xs text-red-700">{test.data.error}</div> : null}
                <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-700">{test.data.logs.join("\n")}</pre>
              </div>
            ) : null}

            <label className="block text-sm font-medium text-zinc-700">
              Display name
              <input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            </label>

            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <input type="checkbox" checked={draftEnabled} onChange={(e) => setDraftEnabled(e.target.checked)} />
              Enabled
            </label>

            <label className="block text-sm font-medium text-zinc-700">
              Config JSON
              <textarea className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs" rows={16} value={draftJson} onChange={(e) => setDraftJson(e.target.value)} />
            </label>

            <div className="text-xs text-zinc-600">
              For <span className="font-semibold">generic_html</span>, use selectors described in the API README.
            </div>

            {patch.error instanceof Error ? <div className="text-sm text-red-700">{patch.error.message}</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}
