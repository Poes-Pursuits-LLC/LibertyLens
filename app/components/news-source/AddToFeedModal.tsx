import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import type { CreateFeedInput, Feed } from "~/core/feed/feed.model";
import { feedService } from "~/services/feedService";

interface AddToFeedModalProps {
  selectedSourceIds: string[];
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function AddToFeedModal({
  selectedSourceIds,
  onClose,
  onSuccess,
  userId,
}: AddToFeedModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeedIds, setSelectedFeedIds] = useState<string[]>([]);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedDescription, setNewFeedDescription] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeeds();
  }, [userId]);

  const loadFeeds = async () => {
    setIsLoading(true);
    try {
      const { feeds } = await feedService.getFeeds(userId);
      setFeeds(feeds);
    } catch (err) {
      setError("Failed to load feeds");
      console.error("Error loading feeds:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeed = (feedId: string) => {
    setSelectedFeedIds((prev) =>
      prev.includes(feedId)
        ? prev.filter((id) => id !== feedId)
        : [...prev, feedId],
    );
  };

  const handleAddToExistingFeeds = async () => {
    if (selectedFeedIds.length === 0) {
      setError("Please select at least one feed");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const promises = selectedFeedIds.map((feedId) =>
        feedService.addSourcesToFeed(feedId, selectedSourceIds, userId),
      );

      await Promise.all(promises);
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to add sources to feeds");
      console.error("Error adding sources:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewFeed = async () => {
    if (!newFeedName.trim()) {
      setError("Feed name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const input: CreateFeedInput & { userId: string } = {
        name: newFeedName.trim(),
        description: newFeedDescription.trim(),
        sources: selectedSourceIds,
        refreshInterval,
        userId,
      };

      const newFeed = await feedService.createFeed(input);
      onSuccess();
      navigate(`/dashboard/feeds/${newFeed.feedId}`);
      onClose();
    } catch (err) {
      setError("Failed to create feed");
      console.error("Error creating feed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    if (activeTab === "existing") {
      handleAddToExistingFeeds();
    } else {
      handleCreateNewFeed();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* This span helps with centering the modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="relative inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Add {selectedSourceIds.length} Source
                {selectedSourceIds.length > 1 ? "s" : ""} to Feed
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("existing")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "existing"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  Add to Existing Feed
                </button>
                <button
                  onClick={() => setActiveTab("new")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "new"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  Create New Feed
                </button>
              </nav>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                Loading feeds...
              </div>
            ) : activeTab === "existing" ? (
              <div className="space-y-4">
                {feeds.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No existing feeds. Create a new feed to get started.
                  </p>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {feeds.map((feed) => (
                      <label
                        key={feed.feedId}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedFeedIds.includes(feed.feedId)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeedIds.includes(feed.feedId)}
                          onChange={() => handleToggleFeed(feed.feedId)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {feed.name}
                          </p>
                          {feed.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {feed.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {feed.sources.length} sources • Updates every{" "}
                            {feed.refreshInterval} minutes
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="feedName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Feed Name
                  </label>
                  <input
                    type="text"
                    id="feedName"
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Economic Freedom Watch"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="feedDescription"
                    value={newFeedDescription}
                    onChange={(e) => setNewFeedDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of what this feed tracks..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="refreshInterval"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Refresh Interval (minutes)
                  </label>
                  <select
                    id="refreshInterval"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every hour</option>
                    <option value="120">Every 2 hours</option>
                    <option value="360">Every 6 hours</option>
                    <option value="720">Every 12 hours</option>
                    <option value="1440">Once a day</option>
                  </select>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={
                  isSaving ||
                  (activeTab === "existing" && selectedFeedIds.length === 0) ||
                  (activeTab === "new" && !newFeedName.trim())
                }
              >
                {isSaving
                  ? "Saving..."
                  : activeTab === "existing"
                    ? "Add to Feed"
                    : "Create Feed"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
