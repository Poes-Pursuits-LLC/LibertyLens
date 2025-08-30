import type { Route } from "./+types/index";
import { Link } from "react-router";
import {
  RssIcon,
  NewspaperIcon,
  SparklesIcon,
  ClockIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Liberty Lens" },
    {
      name: "description",
      content: "Your personalized libertarian news analysis dashboard",
    },
  ];
}

const gettingStartedItems = [
  {
    id: "create-feed",
    title: "Create a Feed",
    description:
      "Set up your first custom news feed with topics you care about",
    completed: false,
    link: "/dashboard/feeds/new",
    icon: RssIcon,
  },
  {
    id: "daily-podcast",
    title: "Listen to a Daily Summary Podcast",
    description: "Get AI-generated audio summaries of your news",
    completed: false,
    link: "/dashboard/podcast",
    icon: PlayCircleIcon,
  },
  {
    id: "add-source",
    title: "Add a Custom News Source",
    description: "Follow trusted sources from across the political spectrum",
    completed: false,
    link: "/dashboard/sources",
    icon: GlobeAltIcon,
  },
  {
    id: "analyze-article",
    title: "Analyze an Article",
    description: "Get instant libertarian perspective on any news article",
    completed: false,
    link: "/dashboard/analyze",
    icon: SparklesIcon,
  },
];

const statsConfig = [
  {
    name: "Active Feeds",
    icon: RssIcon,
    description: "Custom news feeds you've created",
  },
  {
    name: "Articles Analyzed",
    icon: NewspaperIcon,
    description: "Total articles processed through liberty lens",
  },
  {
    name: "Sources Following",
    icon: SparklesIcon,
    description: "News sources in your network",
  },
  {
    name: "Reading Time Saved",
    icon: ClockIcon,
    description: "Time saved with AI summaries",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Liberty Lens
        </h1>
        <p className="mt-2 text-gray-600">
          Your personalized dashboard for liberty-focused news analysis
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Getting Started
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Complete these steps to get the most out of Liberty Lens
          </p>
        </div>
        <div className="space-y-3">
          {gettingStartedItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.completed ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={item.link} className="group">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {item.description}
                    </p>
                  </Link>
                </div>
                <Link to={item.link} className="flex-shrink-0">
                  <Button size="sm" variant="ghost" className="text-xs">
                    {item.completed ? "View" : "Start"}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Progress: 0 of {gettingStartedItems.length} completed
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full w-24">
                <div
                  className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: "0%" }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">0%</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="px-4 py-5 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <dt className="flex items-center gap-x-3 text-sm font-medium text-gray-600">
                    <Icon
                      className="h-5 w-5 text-blue-600"
                      aria-hidden="true"
                    />
                    {stat.name}
                  </dt>
                  <dd className="mt-2">
                    <div className="text-2xl font-semibold text-gray-400">
                      —
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </div>
                  </dd>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Analyses
          </h2>
          <Link
            to="/dashboard/feeds"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            View all feeds
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <Card className="p-8">
          <div className="text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Articles Analyzed Yet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your analyzed articles will appear here. Each article will show:
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Liberty Score (0-100) based on libertarian principles</li>
              <li>• Key insights and bias analysis</li>
              <li>• Source credibility assessment</li>
              <li>• Timestamps and quick summaries</li>
            </ul>
            <div className="mt-6">
              <Link to="/dashboard/analyze">
                <Button size="sm">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Analyze Your First Article
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Create a New Feed
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Customize your news intake with topics and sources that matter to
            you
          </p>
          <Link to="/dashboard/feeds/new">
            <Button className="w-full sm:w-auto">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create Feed
            </Button>
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analyze Any Article
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Paste a URL to get instant libertarian analysis of any article
          </p>
          <Link to="/dashboard/analyze">
            <Button variant="secondary" className="w-full sm:w-auto">
              <SparklesIcon className="h-5 w-5 mr-2" />
              Analyze Article
            </Button>
          </Link>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Discover Sources
          </h2>
          <Link
            to="/dashboard/sources"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            Browse all sources
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <Card className="p-8">
          <div className="text-center">
            <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Sources Added Yet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Discover and follow news sources from across the political
              spectrum. Available source categories include:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-left max-w-2xl mx-auto">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Libertarian</h4>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Reason Magazine</li>
                  <li>• Mises Institute</li>
                  <li>• Liberty Fund</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Mainstream</h4>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Reuters</li>
                  <li>• BBC News</li>
                  <li>• Associated Press</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Alternative</h4>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• The Intercept</li>
                  <li>• Zero Hedge</li>
                  <li>• Ars Technica</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/dashboard/sources">
                <Button size="sm">
                  <GlobeAltIcon className="h-4 w-4 mr-2" />
                  Browse Sources
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
