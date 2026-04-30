import { apiJson } from "./client.js";

export type SearchProfile = {
  id: string;
  name: string;
  query: string;
  excludeKeywords: string[];
  locations: string[];
  remoteOnly: boolean;
  contractTypes: string[];
  isEnabled: boolean;
  sourceIds: string[];
};

export const profilesApi = {
  list(): Promise<{ items: SearchProfile[] }> {
    return apiJson("/api/v1/profiles");
  },
  get(id: string): Promise<{ profile: SearchProfile }> {
    return apiJson(`/api/v1/profiles/${id}`);
  },
  create(body: Omit<SearchProfile, "id">): Promise<{ profile: SearchProfile }> {
    return apiJson("/api/v1/profiles", { method: "POST", body: JSON.stringify(body) });
  },
  patch(id: string, body: Partial<Omit<SearchProfile, "id">>): Promise<{ profile: SearchProfile }> {
    return apiJson(`/api/v1/profiles/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },
  delete(id: string): Promise<{ ok: boolean }> {
    return apiJson(`/api/v1/profiles/${id}`, { method: "DELETE" });
  },
};
