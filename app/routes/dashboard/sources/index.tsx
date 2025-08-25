import type { Route } from "./+types/index";
import { useState } from "react";
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
  GlobeAltIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Browse Sources - Liberty Lens" },
    { name: "description", content: "Discover and add news sources for libertarian analysis" },
  ];
}

// Mock data for news sources
const allSources = [
  // Libertarian & Economics
  { id: "1", name: "Reason Magazine", url: "reason.com", type: "libertarian", description: "Free minds and free markets - libertarian news and commentary", followers: 15420, articles: 892 },
  { id: "2", name: "Mises Institute", url: "mises.org", type: "economics", description: "Austrian economics and libertarian political economy", followers: 8234, articles: 623 },
  { id: "3", name: "FEE", url: "fee.org", type: "economics", description: "Foundation for Economic Education - free market economics", followers: 6789, articles: 445 },
  { id: "4", name: "CATO Institute", url: "cato.org", type: "libertarian", description: "Individual liberty, limited government, and peace", followers: 9876, articles: 723 },
  { id: "5", name: "Liberty Fund", url: "libertyfund.org", type: "libertarian", description: "Educational foundation for individual liberty", followers: 3456, articles: 234 },
  
  // Privacy & Tech
  { id: "6", name: "EFF", url: "eff.org", type: "privacy", description: "Electronic Frontier Foundation - digital rights", followers: 12345, articles: 567 },
  { id: "7", name: "The Intercept", url: "theintercept.com", type: "investigative", description: "Investigative journalism on surveillance and civil liberties", followers: 7890, articles: 423 },
  { id: "8", name: "TechCrunch", url: "techcrunch.com", type: "tech", description: "Technology news and startup ecosystem", followers: 23456, articles: 1234 },
  { id: "9", name: "Ars Technica", url: "arstechnica.com", type: "tech", description: "Technology, science, and policy", followers: 18234, articles: 987 },
  
  // Mainstream Media
  { id: "10", name: "Wall Street Journal", url: "wsj.com", type: "mainstream", description: "Business and financial news", followers: 45678, articles: 2345 },
  { id: "11", name: "Reuters", url: "reuters.com", type: "mainstream", description: "International news agency", followers: 34567, articles: 3456 },
  { id: "12", name: "Bloomberg", url: "bloomberg.com", type: "finance", description: "Business, financial, and economic news", followers: 38901, articles: 2890 },
  { id: "13", name: "Financial Times", url: "ft.com", type: "finance", description: "International business news", followers: 29012, articles: 1890 },
  
  // Alternative & Independent
  { id: "14", name: "Antiwar.com", url: "antiwar.com", type: "foreign-policy", description: "Non-interventionist news and analysis", followers: 4567, articles: 345 },
  { id: "15", name: "The American Conservative", url: "theamericanconservative.com", type: "conservative", description: "Traditional conservative perspectives", followers: 5678, articles: 456 },
  { id: "16", name: "Consortium News", url: "consortiumnews.com", type: "investigative", description: "Independent investigative journalism", followers: 3234, articles: 234 },
];

const sourceTypes = [
  { id: "all", name: "All Sources" },
  { id: "libertarian", name: "Libertarian" },
  { id: "economics", name: "Economics" },
  { id: "privacy", name: "Privacy & Tech" },
  { id: "mainstream", name: "Mainstream" },
  { id: "investigative", name: "Investigative" },
  { id: "finance", name: "Finance" },
];

export default function SourcesIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [followedSources, setFollowedSources] = useState<string[]>(["1", "2", "6"]); // Mock followed sources

  const filteredSources = allSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || source.type === selectedType;
    return matchesSearch && matchesType;
  });

  const toggleFollow = (sourceId: string) => {
    setFollowedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Browse News Sources
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and follow sources for libertarian news analysis
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sourceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <GlobeAltIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allSources.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Sources</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{followedSources.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <PlusIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sources Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSources.map((source) => {
          const isFollowing = followedSources.includes(source.id);
          
          return (
            <Card key={source.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {source.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{source.url}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                  source.type === 'libertarian' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                  source.type === 'economics' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                  source.type === 'privacy' || source.type === 'tech' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' :
                  source.type === 'mainstream' || source.type === 'finance' ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                  'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                }`}>
                  {source.type}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {source.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>{source.followers.toLocaleString()} followers</span>
                <span>{source.articles.toLocaleString()} articles</span>
              </div>
              
              <Button
                variant={isFollowing ? "secondary" : "primary"}
                size="sm"
                className="w-full"
                onClick={() => toggleFollow(source.id)}
              >
                {isFollowing ? (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSources.length === 0 && (
        <Card className="p-12 text-center">
          <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No sources found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </Card>
      )}
    </div>
  );
}
