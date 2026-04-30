import { apiJson } from "./client.js";

export type Source = {
  id: string;
  key: string;
  name: string;
  isEnabled: boolean;
  configJson: Record<string, unknown>;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
};

export const sourcesApi = {
  list(): Promise<{ items: Source[] }> {
    return apiJson("/api/v1/sources");
  },
  patch(id: string, body: Partial<Pick<Source, "name" | "isEnabled" | "configJson">>): Promise<{ source: Source }> {
    return apiJson(`/api/v1/sources/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  test(id: string): Promise<{ ok: boolean; itemCount: number; logs: string[]; error?: string }> {
    return apiJson(`/api/v1/sources/${id}/test`, { method: "POST", body: JSON.stringify({}) });
  },
};
