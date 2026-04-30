import { apiJson } from "./client.js";

export type CrawlRun = {
  id: string;
  jobId: string;
  profileId: string;
  sourceId: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  offersFound: number;
  offersNew: number;
  offersUpdated: number;
  errorMessage: string | null;
  logJson: unknown;
};

export const runsApi = {
  list(params: Record<string, string | undefined>): Promise<{ items: CrawlRun[] }> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") qs.set(k, v);
    }
    return apiJson(`/api/v1/runs?${qs.toString()}`);
  },
  get(id: string): Promise<{ run: CrawlRun }> {
    return apiJson(`/api/v1/runs/${id}`);
  },
  retry(id: string): Promise<{ run: CrawlRun }> {
    return apiJson(`/api/v1/runs/${id}/retry`, { method: "POST", body: JSON.stringify({}) });
  },
};
