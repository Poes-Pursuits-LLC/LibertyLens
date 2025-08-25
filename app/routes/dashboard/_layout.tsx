import { Outlet, NavLink, useLocation } from "react-router";
import {
  HomeIcon,
  RssIcon,
  GlobeAltIcon,
  SparklesIcon,
  CogIcon,
  UserCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolidIcon,
  RssIcon as RssSolidIcon,
  GlobeAltIcon as GlobeSolidIcon,
  SparklesIcon as SparklesSolidIcon,
  CogIcon as CogSolidIcon,
} from "@heroicons/react/24/solid";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: HomeIcon,
    activeIcon: HomeSolidIcon,
  },
  {
    name: "My Feeds",
    href: "/dashboard/feeds",
    icon: RssIcon,
    activeIcon: RssSolidIcon,
  },
  {
    name: "Browse Sources",
    href: "/dashboard/sources",
    icon: GlobeAltIcon,
    activeIcon: GlobeSolidIcon,
  },
  {
    name: "Analyze Article",
    href: "/dashboard/analyze",
    icon: SparklesIcon,
    activeIcon: SparklesSolidIcon,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: CogIcon,
    activeIcon: CogSolidIcon,
  },
];

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Sidebar component */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-blue-600">
              Liberty Lens
            </h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive =
                      location.pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        location.pathname.startsWith(item.href));
                    const Icon = isActive ? item.activeIcon : item.icon;

                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                              isActive
                                ? "bg-gray-100 text-blue-600"
                                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`
                          }
                        >
                          <Icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-700">
                  <UserCircleIcon className="h-8 w-8" aria-hidden="true" />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">John Galt</span>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <h1 className="text-xl font-bold text-blue-600">
          Liberty Lens
        </h1>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/dashboard" &&
                location.pathname.startsWith(item.href));
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-2 py-2 text-xs ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`
                }
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-10 pb-20 lg:pb-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
