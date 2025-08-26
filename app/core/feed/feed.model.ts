import type { AnalysisIntensity } from "../user/user.model";

export type FeedSourceType = "rss" | "api";

export interface NewsSource {
  sourceId: string;
  name: string;
  url: string;
  type: FeedSourceType;
  enabled: boolean;
}

export interface AnalysisSettings {
  intensity: AnalysisIntensity;
  includePrinciples: string[];
  focusAreas: string[];
  includeSources: boolean;
  includeCounterArguments: boolean;
}

export interface FeedConfig {
  feedId: string;
  userId: string;
  name: string;
  description?: string;
  sources: NewsSource[];
  topics: string[];
  keywords: string[];
  excludeKeywords?: string[];
  analysisSettings: AnalysisSettings;
  isActive: boolean;
  refreshInterval: number; // in minutes
  lastRefreshedAt?: string;
  createdAt: string;
  updatedAt: string;
  type: "feed";
}

export interface CreateFeedInput {
  name: string;
  description?: string;
  sources: string[];
  topics?: string[];
  keywords?: string[];
  excludeKeywords?: string[];
  analysisSettings?: Partial<AnalysisSettings>;
  refreshInterval?: number;
}

export interface UpdateFeedInput {
  name?: string;
  description?: string;
  sources?: string[];
  topics?: string[];
  keywords?: string[];
  excludeKeywords?: string[];
  analysisSettings?: Partial<AnalysisSettings>;
  isActive?: boolean;
  refreshInterval?: number;
}

// Default analysis settings
export const defaultAnalysisSettings: AnalysisSettings = {
  intensity: "moderate",
  includePrinciples: [
    "individual-liberty",
    "limited-government",
    "free-markets",
    "property-rights",
    "non-aggression-principle",
  ],
  focusAreas: ["economics", "individual-liberty", "government-overreach"],
  includeSources: true,
  includeCounterArguments: true,
};

// Common libertarian topics
export const libertarianTopics = [
  "free-markets",
  "individual-liberty",
  "property-rights",
  "non-aggression-principle",
  "austrian-economics",
  "fiscal-policy",
  "monetary-policy",
  "civil-liberties",
  "foreign-policy",
  "government-overreach",
  "taxation",
  "regulation",
  "constitutional-rights",
  "decentralization",
  "voluntary-association",
];
