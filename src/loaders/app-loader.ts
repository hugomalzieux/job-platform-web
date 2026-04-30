import { redirect } from "react-router-dom";
import { authApi } from "../lib/api/auth.js";

export async function appLoader() {
  try {
    return await authApi.me();
  } catch {
    throw redirect("/login");
  }
}
