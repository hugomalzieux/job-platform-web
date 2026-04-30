import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsApi } from "../lib/api/settings.js";

const schema = z.object({
  timezone: z.string().min(1),
  notificationEmail: z.string(),
  rawRetentionDays: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function SettingsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["settings"], queryFn: () => settingsApi.get() });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      timezone: "UTC",
      notificationEmail: "",
      rawRetentionDays: "",
    },
  });

  useEffect(() => {
    const s = q.data?.settings;
    if (!s) return;
    form.reset({
      timezone: s.timezone,
      notificationEmail: s.notificationEmail ?? "",
      rawRetentionDays: s.rawRetentionDays === null || s.rawRetentionDays === undefined ? "" : String(s.rawRetentionDays),
    });
  }, [form, q.data?.settings]);

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const email = values.notificationEmail.trim();
      const raw = values.rawRetentionDays.trim();
      const rawRetention = raw === "" ? null : Number(raw);
      if (raw !== "" && !Number.isFinite(rawRetention)) {
        throw new Error("Retention days must be a number");
      }
      return settingsApi.patch({
        timezone: values.timezone,
        notificationEmail: email === "" ? null : email,
        rawRetentionDays: rawRetention,
      });
    },
    onSuccess: async () => await qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const onSubmit = form.handleSubmit((values) => void save.mutateAsync(values));

  if (q.isLoading) return <div className="text-sm text-zinc-600">Loading…</div>;
  if (q.isError) return <div className="text-sm text-red-600">Failed to load settings</div>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600">Timezone and notification hooks</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <label className="block text-sm font-medium text-zinc-700">
          Timezone
          <input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" {...form.register("timezone")} />
          {form.formState.errors.timezone ? (
            <span className="text-xs text-red-600">{form.formState.errors.timezone.message}</span>
          ) : null}
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Notification email (optional digest placeholder)
          <input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" {...form.register("notificationEmail")} />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Raw retention days (optional)
          <input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" {...form.register("rawRetentionDays")} />
        </label>

        <button type="submit" disabled={save.isPending} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50">
          {save.isPending ? "Saving…" : "Save"}
        </button>

        {save.isError ? (
          <div className="text-sm text-red-600">{save.error instanceof Error ? save.error.message : "Save failed"}</div>
        ) : null}
      </form>
    </div>
  );
}
