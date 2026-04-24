import { Layout } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LoginScreen } from "@/components/LoginScreen";
import { useAuth } from "@/hooks/use-auth";
import { DashboardPage } from "@/pages/DashboardPage";
import { FollowUpsPage } from "@/pages/FollowUpsPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { MedicinesPage } from "@/pages/MedicinesPage";
import { ReportsPage } from "@/pages/ReportsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Root wrapper — handles auth gating
function RootComponent() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginScreen />;

  return <Outlet />;
}

// Route tree
const rootRoute = createRootRoute({ component: RootComponent });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const medicinesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/medicines",
  component: MedicinesPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});

const followUpsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/followups",
  component: FollowUpsPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  medicinesRoute,
  reportsRoute,
  followUpsRoute,
  historyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
