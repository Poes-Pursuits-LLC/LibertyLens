import type { Route } from "./+types/index";
import { useState, useEffect } from "react";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useRevalidator,
} from "react-router";
import { NewsSourceList, CustomRSSForm } from "~/components/news-source";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  PlusIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { CreateNewsSourceInput } from "~/core/news-source";
import { dashboardLoader } from "./loaders";

export const loader = dashboardLoader;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "News Sources - Liberty Lens" },
    {
      name: "description",
      content: "Discover and add news sources for libertarian analysis",
    },
  ];
}

export default function SourcesIndex() {
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();

  const actionData = useActionData();
  const loaderData = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const revalidator = useRevalidator();

  console.log("loaderData", loaderData);

  const isLoading =
    navigation.state === "loading" || revalidator.state === "loading";
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData && !actionData.error) {
      setShowAddCustomForm(false);
      revalidator.revalidate();
    }
  }, [actionData, revalidator]);

  const handleAddCustomSource = async (input: CreateNewsSourceInput) => {
    const formData = new FormData();
    formData.append("action", "create");
    formData.append("name", input.name);
    formData.append("description", input.description || "");
    formData.append("url", input.url);
    formData.append("type", input.type);
    formData.append("category", input.category);
    formData.append("logoUrl", input.logoUrl || "");

    if (input.fetchConfig) {
      if (input.fetchConfig.headers) {
        formData.append("headers", JSON.stringify(input.fetchConfig.headers));
      }
      if (input.fetchConfig.apiKey) {
        formData.append("apiKey", input.fetchConfig.apiKey);
      }
      if (input.fetchConfig.rateLimit) {
        formData.append("rateLimit", input.fetchConfig.rateLimit.toString());
      }
      if (input.fetchConfig.selector) {
        formData.append("selector", input.fetchConfig.selector);
      }
    }

    if (input.tags) {
      formData.append("tags", JSON.stringify(input.tags));
    }

    submit(formData, { method: "post" });
  };

  const handleCategoryChange = (category: string | undefined) => {
    setSelectedCategory(category);
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }
    window.history.pushState({}, "", url.toString());
    revalidator.revalidate();
  };

  const error = actionData?.error || loaderData?.error;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            News Sources
          </h1>
        </div>

        <Card className="p-8 text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load News Sources
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button
            onClick={() => revalidator.revalidate()}
            variant="default"
            size="sm"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            News Sources
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Select news sources for your libertarian news analysis feeds
          </p>
        </div>
        <Button
          onClick={() => setShowAddCustomForm(true)}
          variant="default"
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Custom RSS
        </Button>
      </div>

      <NewsSourceList
        sources={loaderData?.sources || []}
        selectedSourceIds={selectedSourceIds}
        onSelectionChange={setSelectedSourceIds}
        isLoading={isLoading}
      />

      {showAddCustomForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAddCustomForm(false)}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Add Custom RSS Feed
                  </h3>
                  <button
                    onClick={() => setShowAddCustomForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {actionData?.error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {actionData.error}
                  </div>
                )}

                <CustomRSSForm
                  onSubmit={handleAddCustomSource}
                  onCancel={() => setShowAddCustomForm(false)}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
