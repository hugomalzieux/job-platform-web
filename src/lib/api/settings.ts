import { apiJson } from "./client.js";

export type AppSettings = {
  id: string;
  userId: string;
  timezone: string;
  notificationEmail: string | null;
  rawRetentionDays: number | null;
};

export const settingsApi = {
  get(): Promise<{ settings: AppSettings }> {
    return apiJson("/api/v1/settings");
  },
  patch(body: Partial<Pick<AppSettings, "timezone" | "notificationEmail" | "rawRetentionDays">>): Promise<{ settings: AppSettings }> {
    return apiJson("/api/v1/settings", { method: "PATCH", body: JSON.stringify(body) });
  },
};
