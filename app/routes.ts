import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/dashboard/_layout.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),
    route("dashboard/feeds", "routes/dashboard/feeds/index.tsx"),
    route("dashboard/feeds/new", "routes/dashboard/feeds/new.tsx"),
    route("dashboard/feeds/:feedId", "routes/dashboard/feeds/$feedId.tsx"),
    route("dashboard/sources", "routes/dashboard/sources/index.tsx"),
    route("dashboard/analyze", "routes/dashboard/analyze/index.tsx"),
    route("dashboard/settings", "routes/dashboard/settings/index.tsx"),
  ]),
] satisfies RouteConfig;
