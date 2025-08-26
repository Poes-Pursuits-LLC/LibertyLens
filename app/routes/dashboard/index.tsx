import type { Route } from "./+types/index";
import { Link } from "react-router";
import {
  RssIcon,
  NewspaperIcon,
  SparklesIcon,
  ClockIcon,
  PlusCircleIcon,
  ArrowRightIcon,
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

// Mock data for demo
const stats = [
  { name: "Active Feeds", value: 3, icon: RssIcon, change: "+1 this week" },
  {
    name: "Articles Analyzed",
    value: 47,
    icon: NewspaperIcon,
    change: "+12 today",
  },
  {
    name: "Sources Following",
    value: 8,
    icon: SparklesIcon,
    change: "2 new available",
  },
  {
    name: "Reading Time Saved",
    value: "2.5h",
    icon: ClockIcon,
    change: "This week",
  },
];

const recentArticles = [
  {
    id: 1,
    title: "Federal Reserve Announces Another Rate Hike",
    source: "Wall Street Journal",
    libertarianScore: 25,
    sentiment: "critical" as const,
    analyzedAt: "2 hours ago",
    keyPoint: "Centralized monetary policy continues to distort market signals",
  },
  {
    id: 2,
    title: "New Privacy Bill Gains Bipartisan Support",
    source: "TechCrunch",
    libertarianScore: 75,
    sentiment: "positive" as const,
    analyzedAt: "4 hours ago",
    keyPoint:
      "Rare win for individual privacy rights against state surveillance",
  },
  {
    id: 3,
    title: "City Council Votes to Reduce Business Licensing Requirements",
    source: "Local News Network",
    libertarianScore: 90,
    sentiment: "positive" as const,
    analyzedAt: "6 hours ago",
    keyPoint: "Removing barriers to entry promotes economic freedom",
  },
];

const suggestedSources = [
  {
    id: 1,
    name: "Reason Magazine",
    description: "Libertarian news and commentary",
    type: "libertarian",
    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Mises Institute",
    description: "Austrian economics and libertarian political theory",
    type: "economics",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Electronic Frontier Foundation",
    description: "Digital privacy and civil liberties",
    type: "privacy",
    image:
      "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, John</h1>
        <p className="mt-2 text-gray-600">
          Here's your liberty-focused news analysis for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="px-4 py-5 sm:p-6 hover:shadow-md transition-shadow"
            >
              <dt className="flex items-center gap-x-3 text-sm font-medium text-gray-600">
                <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                {stat.name}
              </dt>
              <dd className="mt-2 flex items-baseline justify-between">
                <div className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.change}</div>
              </dd>
            </Card>
          );
        })}
      </div>

      {/* Recent Articles */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Analyses
          </h2>
          <Link
            to="/dashboard/feeds"
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentArticles.map((article) => (
            <Card
              key={article.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {article.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-x-4 text-sm text-gray-600">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{article.analyzedAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    {article.keyPoint}
                  </p>
                </div>
                <div className="ml-4 flex flex-col items-center">
                  <div
                    className={`text-2xl font-bold ${
                      article.libertarianScore >= 70
                        ? "text-green-600"
                        : article.libertarianScore >= 40
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {article.libertarianScore}
                  </div>
                  <div className="text-xs text-gray-600">Liberty Score</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Create New Feed */}
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

        {/* Quick Analyze */}
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

      {/* Suggested Sources with Full Background Images */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Suggested Sources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suggestedSources.map((source) => (
            <Card
              key={source.id}
              className="relative overflow-hidden h-64 group hover:shadow-lg transition-shadow"
            >
              {/* Full background image */}
              <img
                src={source.image}
                alt={source.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{source.name}</h3>
                <p className="text-sm text-gray-200 mb-4">
                  {source.description}
                </p>
                <Link to="/dashboard/sources" className="inline-block">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-gray-900"
                  >
                    Add to Feeds
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
