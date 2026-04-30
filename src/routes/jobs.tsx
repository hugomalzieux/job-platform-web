import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "../lib/api/jobs.js";
import { profilesApi } from "../lib/api/profiles.js";

export function JobsPage() {
  const qc = useQueryClient();
  const jobs = useQuery({ queryKey: ["jobs"], queryFn: () => jobsApi.list() });
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: () => profilesApi.list() });

  const [profileId, setProfileId] = useState("");
  const [cron, setCron] = useState("0 8 * * *");
  const [tz, setTz] = useState("Europe/Paris");

  const create = useMutation({
    mutationFn: () =>
      jobsApi.create({
        profileId,
        cronExpression: cron,
        timezone: tz,
        isEnabled: true,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const runNow = useMutation({
    mutationFn: (jobId: string) => jobsApi.runNow(jobId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["jobs"] });
      await qc.invalidateQueries({ queryKey: ["runs"] });
    },
  });

  const toggle = useMutation({
    mutationFn: async (job: { id: string; isEnabled: boolean }) =>
      jobsApi.patch(job.id, { isEnabled: !job.isEnabled }),
    onSuccess: async () => await qc.invalidateQueries({ queryKey: ["jobs"] }),
  });

  if (jobs.isLoading || profiles.isLoading) return <div className="text-sm text-zinc-600">Loading…</div>;
  if (jobs.isError || profiles.isError) return <div className="text-sm text-red-600">Failed to load jobs</div>;

  const profileItems = profiles.data?.items ?? [];
  const jobItems = jobs.data?.items ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Scheduler jobs</h1>
        <p className="mt-1 text-sm text-zinc-600">Cron configuration creates queued crawl runs</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Create job</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="block text-sm font-medium text-zinc-700 lg:col-span-1">
            Profile
            <select className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" value={profileId} onChange={(e) => setProfileId(e.target.value)}>
              <option value="">Select…</option>
              {profileItems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Cron
            <input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm" value={cron} onChange={(e) => setCron(e.target.value)} />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Timezone
            <input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm" value={tz} onChange={(e) => setTz(e.target.value)} />
          </label>
        </div>
        <button
          type="button"
          disabled={!profileId || create.isPending}
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
          onClick={() => void create.mutateAsync()}
        >
          {create.isPending ? "Creating…" : "Create job"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-3 py-2">Profile</th>
              <th className="px-3 py-2">Cron</th>
              <th className="px-3 py-2">Timezone</th>
              <th className="px-3 py-2">Next run</th>
              <th className="px-3 py-2">Enabled</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {jobItems.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-600" colSpan={6}>
                  No jobs
                </td>
              </tr>
            ) : (
              jobItems.map((j) => {
                const p = profileItems.find((x) => x.id === j.profileId);
                return (
                  <tr key={j.id} className="hover:bg-zinc-50">
                    <td className="px-3 py-2">{p?.name ?? j.profileId}</td>
                    <td className="px-3 py-2 font-mono text-xs">{j.cronExpression}</td>
                    <td className="px-3 py-2 font-mono text-xs">{j.timezone}</td>
                    <td className="px-3 py-2 text-xs text-zinc-700">
                      {j.nextRunAt ? new Date(j.nextRunAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" className="text-sm underline" onClick={() => void toggle.mutateAsync(j)}>
                        {j.isEnabled ? "yes" : "no"}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm hover:bg-zinc-50 disabled:opacity-50"
                        disabled={runNow.isPending}
                        onClick={() => void runNow.mutateAsync(j.id)}
                      >
                        Run now
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
