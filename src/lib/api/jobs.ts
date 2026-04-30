import { apiJson } from "./client.js";

export type CrawlJob = {
  id: string;
  profileId: string;
  cronExpression: string;
  timezone: string;
  isEnabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
};

export const jobsApi = {
  list(): Promise<{ items: CrawlJob[] }> {
    return apiJson("/api/v1/jobs");
  },
  create(body: Pick<CrawlJob, "profileId" | "cronExpression" | "timezone"> & { isEnabled?: boolean }): Promise<{ job: CrawlJob }> {
    return apiJson("/api/v1/jobs", { method: "POST", body: JSON.stringify(body) });
  },
  patch(id: string, body: Partial<Pick<CrawlJob, "profileId" | "cronExpression" | "timezone" | "isEnabled">>): Promise<{ job: CrawlJob }> {
    return apiJson(`/api/v1/jobs/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  runNow(id: string): Promise<{ enqueued: number }> {
    return apiJson(`/api/v1/jobs/${id}/run-now`, { method: "POST", body: JSON.stringify({}) });
  },
};
