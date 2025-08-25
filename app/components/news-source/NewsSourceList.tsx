import { useState, useMemo } from 'react'
import type { NewsSource, SourceCategory } from '~/core/news-source'
import { NewsSourceCard } from './NewsSourceCard'

interface NewsSourceListProps {
  sources: NewsSource[]
  selectedSourceIds: string[]
  onSelectionChange: (sourceIds: string[]) => void
  isLoading?: boolean
}

type SortOption = 'name' | 'category' | 'reliability'

const categories: { value: SourceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'libertarian', label: 'Libertarian' },
  { value: 'mainstream', label: 'Mainstream' },
  { value: 'alternative', label: 'Alternative' },
  { value: 'financial', label: 'Financial' },
  { value: 'tech', label: 'Tech' },
  { value: 'international', label: 'International' }
]

export function NewsSourceList({ 
  sources, 
  selectedSourceIds, 
  onSelectionChange, 
  isLoading = false 
}: NewsSourceListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SourceCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')

  // Count sources by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sources.length }
    categories.slice(1).forEach(cat => {
      counts[cat.value] = sources.filter(s => s.category === cat.value).length
    })
    return counts
  }, [sources])

  // Filter and sort sources
  const filteredSources = useMemo(() => {
    let filtered = sources

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(source => 
        source.name.toLowerCase().includes(term) ||
        source.description?.toLowerCase().includes(term) ||
        source.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(source => source.category === selectedCategory)
    }

    // Sort sources
    const sorted = [...filtered]
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'category':
        sorted.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category)
          return catCompare !== 0 ? catCompare : a.name.localeCompare(b.name)
        })
        break
      case 'reliability':
        sorted.sort((a, b) => {
          const scoreCompare = b.reliability.score - a.reliability.score
          return scoreCompare !== 0 ? scoreCompare : a.name.localeCompare(b.name)
        })
        break
    }

    return sorted
  }, [sources, searchTerm, selectedCategory, sortBy])

  const handleToggleSource = (sourceId: string, selected: boolean) => {
    if (selected) {
      onSelectionChange([...selectedSourceIds, sourceId])
    } else {
      onSelectionChange(selectedSourceIds.filter(id => id !== sourceId))
    }
  }

  const handleSelectAll = () => {
    const visibleSourceIds = filteredSources.map(s => s.sourceId)
    const newSelection = new Set([...selectedSourceIds, ...visibleSourceIds])
    onSelectionChange(Array.from(newSelection))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading news sources...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="sr-only">Search news sources</label>
          <input
            id="search"
            type="text"
            placeholder="Search news sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SourceCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} ({categoryCounts[cat.value] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="reliability">Reliability</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-600">
            {selectedSourceIds.length} of {sources.length} selected
          </div>
          <div className="space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Source List */}
      {filteredSources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No news sources found matching your filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSources.map(source => (
            <NewsSourceCard
              key={source.sourceId}
              source={source}
              isSelected={selectedSourceIds.includes(source.sourceId)}
              onToggle={handleToggleSource}
            />
          ))}
        </div>
      )}
    </div>
  )
}
