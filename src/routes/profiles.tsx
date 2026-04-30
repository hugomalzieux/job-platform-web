import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { profilesApi } from "../lib/api/profiles.js";

export function ProfilesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["profiles"], queryFn: () => profilesApi.list() });

  const del = useMutation({
    mutationFn: (id: string) => profilesApi.delete(id),
    onSuccess: async () => await qc.invalidateQueries({ queryKey: ["profiles"] }),
  });

  if (q.isLoading) return <div className="text-sm text-zinc-600">Loading…</div>;
  if (q.isError) return <div className="text-sm text-red-600">Failed to load profiles</div>;

  const items = q.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Search profiles</h1>
          <p className="mt-1 text-sm text-zinc-600">Saved searches mapped to sources</p>
        </div>
        <Link
          to="/profiles/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New profile
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Query</th>
              <th className="px-3 py-2">Enabled</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-600" colSpan={4}>
                  No profiles yet
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-3 py-2 font-medium">
                    <Link className="hover:underline" to={`/profiles/${p.id}`}>
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-zinc-700">{p.query}</td>
                  <td className="px-3 py-2">{p.isEnabled ? "yes" : "no"}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-sm text-red-700 hover:underline"
                      disabled={del.isPending}
                      onClick={() => {
                        if (confirm(`Delete profile "${p.name}"?`)) void del.mutateAsync(p.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
