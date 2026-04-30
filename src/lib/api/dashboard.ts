import { apiJson } from "./client.js";
import type { CrawlRun } from "./runs.js";
import type { Offer } from "./offers.js";

export type DashboardSummary = {
  counts: {
    newOffers: number;
    keptOffers: number;
    dismissedOffers: number;
    failedRuns: number;
  };
  recentRuns: CrawlRun[];
  newOffersPreview: Offer[];
};

export const dashboardApi = {
  summary(): Promise<DashboardSummary> {
    return apiJson("/api/v1/dashboard/summary");
  },
};
