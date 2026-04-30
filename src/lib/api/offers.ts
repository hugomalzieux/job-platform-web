import { apiJson } from "./client.js";

export type Offer = {
  id: string;
  sourceId: string;
  profileId: string | null;
  title: string;
  company: string | null;
  locationText: string | null;
  remoteType: string | null;
  contractType: string | null;
  status: string;
  canonicalUrl: string;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type OfferDetailResponse = {
  offer: Offer & { descriptionText: string | null; salaryText: string | null };
  reviews: { id: string; action: string; note: string | null; createdAt: string }[];
  rawVersions: { id: string; createdAt: string }[];
};

export const offersApi = {
  list(params: Record<string, string | undefined>): Promise<{ items: Offer[]; total: number }> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") qs.set(k, v);
    }
    return apiJson(`/api/v1/offers?${qs.toString()}`);
  },
  get(id: string): Promise<OfferDetailResponse> {
    return apiJson(`/api/v1/offers/${id}`);
  },
  patchStatus(id: string, status: Offer["status"]): Promise<{ offer: Offer }> {
    return apiJson(`/api/v1/offers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  bulkStatus(offerIds: string[], status: Offer["status"]): Promise<{ updated: number }> {
    return apiJson(`/api/v1/offers/bulk-status`, {
      method: "POST",
      body: JSON.stringify({ offerIds, status }),
    });
  },
};
