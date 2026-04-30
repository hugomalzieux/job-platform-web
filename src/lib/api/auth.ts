import { apiJson } from "./client.js";

export type User = { id: string; email: string };

export const authApi = {
  login(email: string, password: string): Promise<{ user: User }> {
    return apiJson("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  logout(): Promise<Record<string, never>> {
    return apiJson("/api/v1/auth/logout", { method: "POST", body: JSON.stringify({}) });
  },
  me(): Promise<{ user: User }> {
    return apiJson("/api/v1/auth/me");
  },
};
