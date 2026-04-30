import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { offersApi, type Offer } from "../lib/api/offers.js";
import { cn } from "../lib/utils.js";

const tabs = ["new", "kept", "dismissed", "applied", "archived", "all"] as const;

export function OffersPage() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") ?? "new") as (typeof tabs)[number];
  const qStr = params.get("q") ?? "";

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const statusForApi = tab === "all" ? undefined : tab;

  const queryKey = useMemo(() => ["offers", tab, qStr], [tab, qStr]);

  const offersQuery = useQuery({
    queryKey,
    queryFn: () =>
      offersApi.list({
        status: statusForApi,
        q: qStr || undefined,
        page: "1",
        pageSize: "50",
      }),
  });

  const bulkDismiss = useMutation({
    mutationFn: async (ids: string[]) => offersApi.bulkStatus(ids, "dismissed"),
    onSuccess: async () => {
      setSelected({});
      await qc.invalidateQueries({ queryKey: ["offers"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const bulkKeep = useMutation({
    mutationFn: async (ids: string[]) => offersApi.bulkStatus(ids, "kept"),
    onSuccess: async () => {
      setSelected({});
      await qc.invalidateQueries({ queryKey: ["offers"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const toggleAll = (items: Offer[]) => {
    const allSelected = items.every((i) => selected[i.id]);
    const next: Record<string, boolean> = { ...selected };
    for (const i of items) next[i.id] = !allSelected;
    setSelected(next);
  };

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const items = offersQuery.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Offers</h1>
          <p className="mt-1 text-sm text-zinc-600">Fast inbox for triage</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={selectedIds.length === 0 || bulkDismiss.isPending}
            onClick={() => void bulkDismiss.mutateAsync(selectedIds)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
          >
            Dismiss selected
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || bulkKeep.isPending}
            onClick={() => void bulkKeep.mutateAsync(selectedIds)}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Keep selected
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const label = t;
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              className={cn(
                "rounded-full px-3 py-1 text-sm capitalize",
                active ? "bg-zinc-900 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200",
              )}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("tab", t);
                setParams(next);
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <input
          value={qStr}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            const v = e.target.value;
            if (v) next.set("q", v);
            else next.delete("q");
            setParams(next);
          }}
          placeholder="Search title…"
          className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={items.length > 0 && items.every((i) => selected[i.id])}
                  onChange={() => toggleAll(items)}
                />
              </th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {offersQuery.isLoading ? (
              <tr>
                <td className="px-3 py-4 text-zinc-600" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-600" colSpan={5}>
                  No offers
                </td>
              </tr>
            ) : (
              items.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={Boolean(selected[o.id])}
                      onChange={(e) => setSelected((prev) => ({ ...prev, [o.id]: e.target.checked }))}
                      aria-label={`Select ${o.title}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Link className="font-medium text-zinc-900 hover:underline" to={`/offers/${o.id}`}>
                      {o.title}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-500">{o.canonicalUrl}</div>
                  </td>
                  <td className="px-3 py-2 text-zinc-700">{o.company ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize">{o.status}</span>
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-600">{new Date(o.firstSeenAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
