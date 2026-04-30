import { NavLink, Outlet, useNavigate, useRouteLoaderData } from "react-router-dom";
import type { User } from "../../lib/api/auth.js";
import { authApi } from "../../lib/api/auth.js";
import { cn } from "../../lib/utils.js";

function SignOutButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="mt-3 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
      onClick={() => {
        void authApi.logout().finally(() => navigate("/login"));
      }}
    >
      Sign out
    </button>
  );
}

export function AppShell() {
  const data = useRouteLoaderData("app") as { user: User };
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "block rounded-md px-3 py-2 text-sm font-medium",
      isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100",
    );

  return (
    <div className="flex min-h-full">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white p-4">
        <div className="mb-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Job Platform</div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" className={linkClass} end>
            Dashboard
          </NavLink>
          <NavLink to="/offers" className={linkClass}>
            Offers
          </NavLink>
          <NavLink to="/profiles" className={linkClass}>
            Profiles
          </NavLink>
          <NavLink to="/sources" className={linkClass}>
            Sources
          </NavLink>
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>
          <NavLink to="/runs" className={linkClass}>
            Runs
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>
        </nav>
        <div className="mt-8 border-t border-zinc-100 pt-4 text-xs text-zinc-600">{data.user.email}</div>
        <SignOutButton />
      </aside>
      <main className="min-w-0 flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
