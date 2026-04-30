import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell.js";
import { appLoader } from "../loaders/app-loader.js";
import { DashboardPage } from "../routes/dashboard.js";
import { JobsPage } from "../routes/jobs.js";
import { LoginPage } from "../routes/login.js";
import { OfferDetailPage } from "../routes/offer-detail.js";
import { OffersPage } from "../routes/offers.js";
import { ProfileEditPage } from "../routes/profile-edit.js";
import { ProfileNewPage } from "../routes/profile-new.js";
import { ProfilesPage } from "../routes/profiles.js";
import { RunDetailPage } from "../routes/run-detail.js";
import { RunsPage } from "../routes/runs.js";
import { SettingsPage } from "../routes/settings.js";
import { SourcesPage } from "../routes/sources.js";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  {
    id: "app",
    path: "/",
    loader: appLoader,
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      { path: "offers", Component: OffersPage },
      { path: "offers/:offerId", Component: OfferDetailPage },
      { path: "profiles", Component: ProfilesPage },
      { path: "profiles/new", Component: ProfileNewPage },
      { path: "profiles/:profileId", Component: ProfileEditPage },
      { path: "sources", Component: SourcesPage },
      { path: "jobs", Component: JobsPage },
      { path: "runs", Component: RunsPage },
      { path: "runs/:runId", Component: RunDetailPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
