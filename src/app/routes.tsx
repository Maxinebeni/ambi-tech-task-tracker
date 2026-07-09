import { createBrowserRouter } from "react-router";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Strategy } from "./components/Strategy";
import { Projects } from "./components/Projects";
import { MyWeek } from "./components/MyWeek";
import { Calendar } from "./components/Calendar";
import { Approvals } from "./components/Approvals";
import { Team } from "./components/Team";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: () => (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/strategy",
    Component: () => (
      <RequireAuth>
        <Strategy />
      </RequireAuth>
    ),
  },
  {
    path: "/projects",
    Component: () => (
      <RequireAuth>
        <Projects />
      </RequireAuth>
    ),
  },
  {
    path: "/my-week",
    Component: () => (
      <RequireAuth>
        <MyWeek />
      </RequireAuth>
    ),
  },
  {
    path: "/calendar",
    Component: () => (
      <RequireAuth>
        <Calendar />
      </RequireAuth>
    ),
  },
  {
    path: "/approvals",
    Component: () => (
      <RequireAuth>
        <Approvals />
      </RequireAuth>
    ),
  },
  {
    path: "/team",
    Component: () => (
      <RequireAuth>
        <Team />
      </RequireAuth>
    ),
  },
]);