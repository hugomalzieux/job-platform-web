import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "../lib/api/client.js";
import { authApi } from "../lib/api/auth.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.login(values.email, values.password);
      navigate("/");
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        const code = e.body?.error.code;
        const hint =
          code === "FORBIDDEN_ORIGIN"
            ? `API rejected this page’s origin. Set APP_BASE_URL on the server to exactly ${typeof window !== "undefined" ? window.location.origin : "(your SPA origin)"} (include :port if shown in the address bar), redeploy the API, or add that origin to CORS_ORIGINS.`
            : e.body?.error.message ?? "Forbidden";
        setError("root", { message: hint });
        return;
      }
      const message =
        e instanceof Error ? e.message : "Something went wrong. Check the console and API URL.";
      setError("root", { message });
    }
  });

  return (
    <div className="flex min-h-full items-center justify-center bg-zinc-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-600">Personal job monitoring dashboard</p>
        <label className="mt-6 block text-sm font-medium text-zinc-700">
          Email
          <input
            type="email"
            autoComplete="username"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            {...register("email")}
          />
          {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
        </label>
        <label className="mt-4 block text-sm font-medium text-zinc-700">
          Password
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            {...register("password")}
          />
          {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
        </label>
        {errors.root ? <p className="mt-3 text-sm text-red-600">{errors.root.message}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
