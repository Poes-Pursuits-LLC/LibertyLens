import { useState } from 'react'
import type { CreateNewsSourceInput, SourceCategory } from '~/core/news-source'
import { useTestRssFeed } from '~/services/news-source.hooks'

interface CustomRSSFormProps {
  onSubmit: (data: CreateNewsSourceInput) => void | Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function CustomRSSForm({ onSubmit, onCancel, isSubmitting = false }: CustomRSSFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: 'alternative' as SourceCategory,
    tags: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const testRssFeed = useTestRssFeed()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Feed name is required'
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Feed URL is required'
    } else {
      try {
        new URL(formData.url)
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTestFeed = async () => {
    if (!formData.url.trim()) {
      setErrors({ ...errors, url: 'Please enter a URL to test' })
      return
    }

    try {
      new URL(formData.url)
    } catch {
      setErrors({ ...errors, url: 'Please enter a valid URL' })
      return
    }

    setTestStatus('testing')
    setTestMessage('Testing feed...')

    try {
      const result = await testRssFeed.mutateAsync(formData.url)
      
      if (result.isValid) {
        setTestStatus('success')
        setTestMessage(`Feed is valid! Found ${result.feedInfo?.itemCount || 0} items`)
        
        // Auto-fill name and description if empty
        if (!formData.name && result.feedInfo?.title) {
          setFormData(prev => ({ ...prev, name: result.feedInfo!.title }))
        }
        if (!formData.description && result.feedInfo?.description) {
          setFormData(prev => ({ ...prev, description: result.feedInfo!.description }))
        }
      } else {
        setTestStatus('error')
        setTestMessage(result.message || 'Failed to validate feed')
      }
    } catch (error) {
      setTestStatus('error')
      setTestMessage('Failed to validate feed. Please check the URL.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    await onSubmit({
      name: formData.name.trim(),
      url: formData.url.trim(),
      description: formData.description.trim() || undefined,
      type: 'rss',
      category: formData.category,
      tags: tags.length > 0 ? tags : undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Feed Name
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          maxLength={100}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* URL */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          Feed URL
        </label>
        <div className="flex gap-2">
          <input
            id="url"
            type="text"
            value={formData.url}
            onChange={(e) => {
              setFormData({ ...formData, url: e.target.value })
              setTestStatus('idle')
            }}
            placeholder="https://example.com/feed.xml"
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.url ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={handleTestFeed}
            disabled={testStatus === 'testing'}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Feed'}
          </button>
        </div>
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url}</p>
        )}
        {testStatus !== 'idle' && (
          <p className={`mt-1 text-sm ${
            testStatus === 'success' ? 'text-green-600' : 
            testStatus === 'error' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {testMessage}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as SourceCategory })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="alternative">Alternative</option>
          <option value="libertarian">Libertarian</option>
          <option value="mainstream">Mainstream</option>
          <option value="financial">Financial</option>
          <option value="tech">Tech</option>
          <option value="international">International</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="news, politics, economics (comma separated)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Feed'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
