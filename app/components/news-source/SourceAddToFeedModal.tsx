import { useEffect, useMemo, useState } from "react"
import { useFetcher } from "react-router"

type FeedOption = { id: string; name: string }

interface SourceAddToFeedModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  feeds: FeedOption[]
  selectedSourceIds: string[]
  userId?: string
}

export function SourceAddToFeedModal({
  open,
  onClose,
  onSuccess,
  feeds,
  selectedSourceIds,
  userId,
}: SourceAddToFeedModalProps) {
  const fetcher = useFetcher<{ success?: boolean; error?: string; feedId?: string }>()
  const [mode, setMode] = useState<"existing" | "create">(feeds.length > 0 ? "existing" : "create")
  const [selectedFeedId, setSelectedFeedId] = useState<string>("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const disabled = fetcher.state !== "idle"

  const defaultCreateName = useMemo(
    () => `New feed (${selectedSourceIds.length} source${selectedSourceIds.length === 1 ? "" : "s"})`,
    [selectedSourceIds.length],
  )

  useEffect(() => {
    if (mode === "create" && !name) {
      setName(defaultCreateName)
    }
  }, [mode, defaultCreateName, name])

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      onSuccess()
    }
  }, [fetcher.state, fetcher.data, onSuccess])

  if (!open) return null

  const handleAddToExisting = () => {
    if (!userId || !selectedFeedId || selectedSourceIds.length === 0) return
    const fd = new FormData()
    fd.append("action", "addToFeed")
    fd.append("userId", userId)
    fd.append("feedId", selectedFeedId)
    fd.append("selectedSourceIds", JSON.stringify(selectedSourceIds))
    fetcher.submit(fd, { method: "post", action: "/dashboard/sources" })
  }

  const handleCreateFeed = () => {
    if (!userId || !name.trim() || selectedSourceIds.length === 0) return
    const fd = new FormData()
    fd.append("action", "createFeedFromSources")
    fd.append("userId", userId)
    fd.append("name", name.trim())
    if (description.trim()) fd.append("description", description.trim())
    fd.append("selectedSourceIds", JSON.stringify(selectedSourceIds))
    fetcher.submit(fd, { method: "post", action: "/dashboard/sources" })
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40" onClick={() => (!disabled ? onClose() : undefined)} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-900 shadow-xl">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add {selectedSourceIds.length} Source
              {selectedSourceIds.length > 1 ? "s" : ""} to Feed
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
              onClick={onClose} 
              disabled={disabled}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {fetcher.data?.error && (
            <div className="mx-4 mt-4 rounded border border-red-300 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
              {fetcher.data.error}
            </div>
          )}

          <div className="p-4">
            {/* Mode toggle */}
            <div className="mb-4 inline-flex rounded-md border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-800">
              <button
                type="button"
                className={`px-3 py-1 text-sm rounded ${
                  mode === "existing" 
                    ? "bg-white dark:bg-gray-900 shadow" 
                    : "text-gray-600 dark:text-gray-400"
                }`}
                onClick={() => setMode("existing")}
                disabled={disabled}
              >
                Existing Feed
              </button>
              <button
                type="button"
                className={`ml-1 px-3 py-1 text-sm rounded ${
                  mode === "create" 
                    ? "bg-white dark:bg-gray-900 shadow" 
                    : "text-gray-600 dark:text-gray-400"
                }`}
                onClick={() => setMode("create")}
                disabled={disabled}
              >
                Create New
              </button>
            </div>

            {mode === "existing" ? (
              <div className="space-y-4">
                {feeds.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    You don't have any feeds yet. Switch to "Create New".
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-auto pr-1">
                    {feeds.map((f) => (
                      <label 
                        key={f.id} 
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="feed"
                          value={f.id}
                          checked={selectedFeedId === f.id}
                          onChange={() => setSelectedFeedId(f.id)}
                          disabled={disabled}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 dark:text-white">{f.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="feedName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Feed Name
                  </label>
                  <input
                    id="feedName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={100}
                    disabled={disabled}
                    placeholder={defaultCreateName}
                  />
                </div>
                <div>
                  <label htmlFor="feedDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="feedDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    maxLength={500}
                    disabled={disabled}
                    placeholder="Describe this feed..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSourceIds.length} source{selectedSourceIds.length === 1 ? "" : "s"} selected
            </div>
            <div className="flex gap-2">
              <button 
                className="rounded px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" 
                onClick={onClose} 
                disabled={disabled}
              >
                Cancel
              </button>
              {mode === "existing" ? (
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleAddToExisting}
                  disabled={disabled || !userId || !selectedFeedId || selectedSourceIds.length === 0}
                >
                  {disabled ? "Adding..." : "Add to Existing Feed"}
                </button>
              ) : (
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleCreateFeed}
                  disabled={disabled || !userId || !name.trim() || selectedSourceIds.length === 0}
                >
                  {disabled ? "Creating..." : "Create Feed"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
