import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { profilesApi } from "../lib/api/profiles.js";
import { sourcesApi } from "../lib/api/sources.js";

const schema = z.object({
  name: z.string().min(1),
  query: z.string().min(1),
  excludeKeywords: z.string(),
  locations: z.string(),
  remoteOnly: z.boolean(),
  contractTypes: z.string(),
  isEnabled: z.boolean(),
  sourceIds: z.array(z.string().uuid()).min(1),
});

type FormValues = z.infer<typeof schema>;

function splitLinesOrComma(raw: string): string[] {
  return raw
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProfileEditorPage(props: { mode: "new" | "edit" }) {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const sources = useQuery({ queryKey: ["sources"], queryFn: () => sourcesApi.list() });

  const profileQuery = useQuery({
    queryKey: ["profile", profileId],
    enabled: props.mode === "edit" && Boolean(profileId),
    queryFn: () => profilesApi.get(profileId!),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      query: "",
      excludeKeywords: "",
      locations: "",
      remoteOnly: false,
      contractTypes: "",
      isEnabled: true,
      sourceIds: [],
    },
  });

  useEffect(() => {
    if (props.mode !== "edit") return;
    const p = profileQuery.data?.profile;
    if (!p) return;
    form.reset({
      name: p.name,
      query: p.query,
      excludeKeywords: p.excludeKeywords.join("\n"),
      locations: p.locations.join("\n"),
      remoteOnly: p.remoteOnly,
      contractTypes: p.contractTypes.join("\n"),
      isEnabled: p.isEnabled,
      sourceIds: p.sourceIds,
    });
  }, [form, profileQuery.data?.profile, props.mode]);

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name,
        query: values.query,
        excludeKeywords: splitLinesOrComma(values.excludeKeywords),
        locations: splitLinesOrComma(values.locations),
        remoteOnly: values.remoteOnly,
        contractTypes: splitLinesOrComma(values.contractTypes),
        isEnabled: values.isEnabled,
        sourceIds: values.sourceIds,
      };
      if (props.mode === "new") return profilesApi.create(payload);
      return profilesApi.patch(profileId!, payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["profiles"] });
      navigate("/profiles");
    },
  });

  const onSubmit = form.handleSubmit((values) => void save.mutateAsync(values));

  if (sources.isLoading) return <div className="text-sm text-zinc-600">Loading sources…</div>;
  if (props.mode === "edit" && profileQuery.isLoading) return <div className="text-sm text-zinc-600">Loading profile…</div>;

  const sourceItems = sources.data?.items ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{props.mode === "new" ? "New profile" : "Edit profile"}</h1>
        <p className="mt-1 text-sm text-zinc-600">Keywords flow into connectors as hints</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <label className="block text-sm font-medium text-zinc-700">
          Name
          <input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" {...form.register("name")} />
          {form.formState.errors.name ? (
            <span className="text-xs text-red-600">{form.formState.errors.name.message}</span>
          ) : null}
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Query
          <textarea className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" rows={3} {...form.register("query")} />
          {form.formState.errors.query ? (
            <span className="text-xs text-red-600">{form.formState.errors.query.message}</span>
          ) : null}
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Exclude keywords (comma or newline separated)
          <textarea className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" rows={2} {...form.register("excludeKeywords")} />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Locations (comma or newline separated)
          <textarea className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" rows={2} {...form.register("locations")} />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input type="checkbox" {...form.register("remoteOnly")} />
          Remote only
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Contract types (comma or newline separated)
          <textarea className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" rows={2} {...form.register("contractTypes")} />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input type="checkbox" {...form.register("isEnabled")} />
          Enabled
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-zinc-700">Sources</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {sourceItems.map((s) => {
              const checked = form.watch("sourceIds").includes(s.id);
              return (
                <label key={s.id} className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const cur = form.getValues("sourceIds");
                      if (e.target.checked) form.setValue("sourceIds", [...cur, s.id], { shouldValidate: true });
                      else form.setValue(
                        "sourceIds",
                        cur.filter((id) => id !== s.id),
                        { shouldValidate: true },
                      );
                    }}
                  />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-zinc-500">{s.key}</span>
                </label>
              );
            })}
          </div>
          {form.formState.errors.sourceIds ? (
            <span className="text-xs text-red-600">{form.formState.errors.sourceIds.message}</span>
          ) : null}
        </fieldset>

        {save.isError ? <div className="text-sm text-red-600">Save failed</div> : null}

        <div className="flex gap-3">
          <button type="submit" disabled={save.isPending} className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50">
            {save.isPending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
