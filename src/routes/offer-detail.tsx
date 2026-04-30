import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { offersApi } from "../lib/api/offers.js";
import { format } from "date-fns";

const actions = ["kept", "dismissed", "applied", "archived"] as const;

export function OfferDetailPage() {
  const { offerId } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const q = useQuery({
    queryKey: ["offer", offerId],
    enabled: Boolean(offerId),
    queryFn: () => offersApi.get(offerId!),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => offersApi.patchStatus(offerId!, status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["offer", offerId] });
      await qc.invalidateQueries({ queryKey: ["offers"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  if (!offerId) return null;
  if (q.isLoading) return <div className="text-sm text-zinc-600">Loading…</div>;
  if (q.isError || !q.data) return <div className="text-sm text-red-600">Offer not found</div>;

  const { offer, reviews } = q.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/offers" className="text-sm text-zinc-600 hover:underline">
            ← Back to inbox
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{offer.title}</h1>
          <div className="mt-2 text-sm text-zinc-700">
            {(offer.company ?? "Unknown company") +
              (offer.locationText ? ` · ${offer.locationText}` : "")}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a) => (
              <button
                key={a}
                type="button"
                disabled={statusMutation.isPending}
                onClick={() => void statusMutation.mutateAsync(a)}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                Mark {a}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void navigate(-1)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
            >
              Back
            </button>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Status</div>
          <div className="mt-2 capitalize">{offer.status}</div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Open source</div>
          <a className="mt-2 block break-all text-zinc-900 underline" href={offer.canonicalUrl} target="_blank" rel="noreferrer">
            {offer.canonicalUrl}
          </a>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Description</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-zinc-800">{offer.descriptionText ?? "—"}</pre>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Timeline</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li>
              <span className="font-medium">First seen:</span>{" "}
              <span className="text-zinc-700">{format(new Date(offer.firstSeenAt), "PPpp")}</span>
            </li>
            <li>
              <span className="font-medium">Last seen:</span>{" "}
              <span className="text-zinc-700">{format(new Date(offer.lastSeenAt), "PPpp")}</span>
            </li>
          </ul>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Reviews</h3>
          <ul className="mt-3 divide-y divide-zinc-100">
            {reviews.length === 0 ? (
              <li className="py-2 text-sm text-zinc-600">No review actions yet</li>
            ) : (
              reviews.map((r) => (
                <li key={r.id} className="py-2 text-sm">
                  <div className="font-medium">{r.action}</div>
                  <div className="text-xs text-zinc-600">{format(new Date(r.createdAt), "PPpp")}</div>
                  {r.note ? <div className="mt-1 text-sm text-zinc-700">{r.note}</div> : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
