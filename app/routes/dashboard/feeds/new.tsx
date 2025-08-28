import type { Route } from "./+types/new";
import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { 
  ArrowLeftIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { feedsAction } from "~/actions/feeds.action";
import { feedsNewLoader } from "~/loaders/feeds-new.loader";
import { libertarianTopics } from "~/core/feed/feed.model";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create New Feed - Liberty Lens" },
    { name: "description", content: "Create a custom libertarian news feed" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  return await feedsNewLoader(args);
}

export async function action(args: Route.ActionArgs) {
  return await feedsAction(args);
}

export default function NewFeed({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { sources: availableSources = [] } = (loaderData as any) ?? { sources: [] };
  const availableTopics = libertarianTopics.map((t) => ({
    id: t,
    name: t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: '',
  }));

  const [feedName, setFeedName] = useState("");
  const [feedDescription, setFeedDescription] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [analysisIntensity, setAnalysisIntensity] = useState<"light" | "moderate" | "deep">("moderate");

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate("/dashboard/feeds")}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to feeds
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Feed
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customize your news feed with sources and topics aligned with liberty
        </p>
      </div>

      <Form method="post" className="space-y-6">
        <input type="hidden" name="action" value="create" />
        <input type="hidden" name="sources" value={JSON.stringify(selectedSources)} />
        <input type="hidden" name="topics" value={JSON.stringify(selectedTopics)} />
        <input type="hidden" name="analysisIntensity" value={analysisIntensity} />
        {/* Optional: refreshInterval could be added later */}

        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Feed Information
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="feedName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Feed Name
              </label>
              <input
                type="text"
                id="feedName"
                name="name"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Economic Freedom Watch"
                required
              />
            </div>
            <div>
              <label htmlFor="feedDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="feedDescription"
                name="description"
                value={feedDescription}
                onChange={(e) => setFeedDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of what this feed tracks..."
              />
            </div>
          </div>
        </Card>

        {/* Source Selection */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select News Sources
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose sources to include in your feed (minimum 1 required)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableSources.map((source: any) => (
              <button
                key={source.sourceId}
                type="button"
                onClick={() => toggleSource(source.sourceId)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedSources.includes(source.sourceId)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{source.name}</h3>
                    {source.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{source.description}</p>
                    )}
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                      {source.category}
                    </span>
                  </div>
                  {selectedSources.includes(source.sourceId) && (
                    <CheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Topic Selection */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Topics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose topics to focus your feed (minimum 1 required)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTopics.includes(topic.id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{topic.name}</h3>
                    {topic.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{topic.description}</p>
                    )}
                  </div>
                  {selectedTopics.includes(topic.id) && (
                    <CheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Analysis Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analysis Intensity
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            How deeply should articles be analyzed?
          </p>
          <div className="space-y-3">
            {[
              { value: "light", label: "Light", description: "Quick libertarian perspective highlights" },
              { value: "moderate", label: "Moderate", description: "Balanced analysis with key principles" },
              { value: "deep", label: "Deep", description: "Comprehensive libertarian critique" },
            ].map((option) => (
              <label key={option.value} className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="analysisIntensityRadio"
                  value={option.value}
                  checked={analysisIntensity === option.value}
                  onChange={(e) => setAnalysisIntensity(e.target.value as any)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button 
            type="button" 
            variant="ghost"
            onClick={() => navigate("/dashboard/feeds")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={selectedSources.length === 0 || selectedTopics.length === 0 || !feedName}
          >
            Create Feed
          </Button>
        </div>
      </Form>
    </div>
  );
}
