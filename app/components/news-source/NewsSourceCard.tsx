import { useState } from 'react'
import type { NewsSource } from '~/core/news-source'

interface NewsSourceCardProps {
  source: NewsSource
  isSelected: boolean
  onToggle: (sourceId: string, selected: boolean) => void
  disabled?: boolean
}

export function NewsSourceCard({ source, isSelected, onToggle, disabled = false }: NewsSourceCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getReliabilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      libertarian: 'bg-purple-100 text-purple-800',
      mainstream: 'bg-blue-100 text-blue-800',
      alternative: 'bg-green-100 text-green-800',
      financial: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-cyan-100 text-cyan-800',
      international: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const handleToggle = () => {
    if (!disabled && source.isActive) {
      onToggle(source.sourceId, !isSelected)
    }
  }

  return (
    <div 
      className={`
        border rounded-lg p-4 transition-all
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
        ${disabled || !source.isActive ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
      `}
      onClick={handleToggle}
    >
      <div className="flex items-start gap-4">
        {/* Logo or Initials */}
        <div className="flex-shrink-0">
          {source.logoUrl && !imageError ? (
            <img 
              src={source.logoUrl} 
              alt={`${source.name} logo`}
              className="w-12 h-12 rounded-lg object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
              {getInitials(source.name)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900" data-testid="source-name">
                {source.name}
              </h3>
              {source.description && (
                <p className="text-sm text-gray-600 mt-1">{source.description}</p>
              )}
            </div>

            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
              disabled={disabled || !source.isActive}
              className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              aria-label={`Select ${source.name}`}
            />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Category */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(source.category)}`}>
              {source.category}
            </span>

            {/* Reliability */}
            <span className={`text-sm font-medium ${getReliabilityColor(source.reliability.score)}`}>
              {source.reliability.score}%
            </span>

            {/* Tags */}
            {source.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {tag}
              </span>
            ))}

            {/* Status indicators */}
            {!source.isActive && (
              <span className="text-xs text-red-600 font-medium">Inactive</span>
            )}
            {source.addedByUserId && (
              <span className="text-xs text-blue-600 font-medium">Custom</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
