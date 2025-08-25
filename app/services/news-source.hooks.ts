import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NewsSource, CreateNewsSourceInput, UpdateNewsSourceInput, SourceCategory } from '~/core/news-source';
import { apiClient } from './api.client';

interface NewsSourcesResponse {
  sources: NewsSource[];
  count: number;
  categories: string[];
}

interface TestRssResponse {
  url: string;
  type: string;
  isValid: boolean;
  feedInfo?: {
    title: string;
    description?: string;
    link?: string;
    itemCount: number;
  };
  error?: string;
  message: string;
  testTimestamp: string;
}

// Query keys
const newsSourceKeys = {
  all: ['news-sources'] as const,
  lists: () => [...newsSourceKeys.all, 'list'] as const,
  list: (filters?: { category?: SourceCategory }) => 
    [...newsSourceKeys.lists(), filters] as const,
  details: () => [...newsSourceKeys.all, 'detail'] as const,
  detail: (id: string) => [...newsSourceKeys.details(), id] as const,
};

// Fetch all news sources
export function useNewsSources(category?: SourceCategory) {
  const queryKey = newsSourceKeys.list({ category });
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      
      const path = params.toString() ? `/sources?${params}` : '/sources';
      return apiClient.get<NewsSourcesResponse>(path);
    },
  });
}

// Fetch a single news source
export function useNewsSource(sourceId: string) {
  return useQuery({
    queryKey: newsSourceKeys.detail(sourceId),
    queryFn: () => apiClient.get<NewsSource>(`/sources/${sourceId}`),
    enabled: !!sourceId,
  });
}

// Create a new news source
export function useCreateNewsSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateNewsSourceInput) => 
      apiClient.post<NewsSource>('/sources', input),
    onSuccess: () => {
      // Invalidate and refetch news sources
      queryClient.invalidateQueries({ queryKey: newsSourceKeys.lists() });
    },
  });
}

// Update a news source
export function useUpdateNewsSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      sourceId, 
      updates 
    }: { 
      sourceId: string; 
      updates: UpdateNewsSourceInput 
    }) => apiClient.patch<NewsSource>(`/sources/${sourceId}`, updates),
    onSuccess: (data) => {
      // Update the specific news source in the cache
      queryClient.setQueryData(newsSourceKeys.detail(data.sourceId), data);
      // Invalidate the list to ensure consistency
      queryClient.invalidateQueries({ queryKey: newsSourceKeys.lists() });
    },
  });
}

// Delete a news source
export function useDeleteNewsSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sourceId: string) => 
      apiClient.delete(`/sources/${sourceId}`),
    onSuccess: (_, sourceId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: newsSourceKeys.detail(sourceId) });
      // Invalidate the list
      queryClient.invalidateQueries({ queryKey: newsSourceKeys.lists() });
    },
  });
}

// Test RSS feed
export function useTestRssFeed() {
  return useMutation({
    mutationFn: (url: string) => 
      apiClient.post<TestRssResponse>('/sources/test', { url }),
  });
}
