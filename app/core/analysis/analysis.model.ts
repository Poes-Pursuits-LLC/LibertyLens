export type Sentiment = 'positive' | 'neutral' | 'critical'
export type Relevance = 'high' | 'medium' | 'low'

export interface LibertarianPrinciple {
    name: string
    relevance: Relevance
    explanation: string
    examples?: string[]
}

export interface Analysis {
  analysisId: string;
  articleId: string;
  feedId: string;
  userId: string; // Who requested the analysis
  libertarianScore: number; // 0-100, how aligned with libertarian principles
  keyPoints: string[];
  principles: LibertarianPrinciple[];
  summary: string;
  fullAnalysis: string;
  sentiment: Sentiment;
  recommendations: string[]; // Liberty-oriented alternative perspectives
  counterArguments?: string[]; // If enabled in feed settings
  sources?: string[]; // Supporting sources for claims
  metadata: {
    analysisVersion: string; // Model version used
    processingTime: number; // in milliseconds
    wordCount: number;
    confidence: number; // 0-1
  };
  createdAt: string;
  updatedAt: string;
  type: 'analysis';
}

export interface CreateAnalysisInput {
  articleId: string;
  feedId: string;
  userId: string;
  analysisSettings: {
    intensity: 'light' | 'moderate' | 'deep';
    focusAreas: string[];
    includeSources: boolean;
    includeCounterArguments: boolean;
  };
}

export interface AnalysisFilter {
  feedId?: string;
  articleId?: string;
  userId?: string;
  minScore?: number;
  maxScore?: number;
  sentiment?: Sentiment;
  principles?: string[];
  createdAfter?: string;
  createdBefore?: string;
}

// Core libertarian principles for analysis
export const libertarianPrinciples = {
  NAP: 'Non-Aggression Principle',
  PROPERTY_RIGHTS: 'Property Rights',
  FREE_MARKETS: 'Free Markets',
  INDIVIDUAL_LIBERTY: 'Individual Liberty',
  LIMITED_GOVERNMENT: 'Limited Government',
  VOLUNTARY_ASSOCIATION: 'Voluntary Association',
  SELF_OWNERSHIP: 'Self-Ownership',
  FISCAL_RESPONSIBILITY: 'Fiscal Responsibility',
  CONSTITUTIONAL_LIMITS: 'Constitutional Limits',
  DECENTRALIZATION: 'Decentralization'
};

// Analysis prompts for different intensity levels
export const analysisPrompts = {
  light: `Provide a brief libertarian perspective on this article, focusing on:
1. Key libertarian principles involved
2. Main concerns from a liberty standpoint
3. A short summary of the libertarian view`,
  
  moderate: `Analyze this article from a libertarian perspective, including:
1. Relevant libertarian principles (NAP, property rights, free markets, etc.)
2. Detailed critique of statist assumptions
3. Economic analysis using Austrian economics where applicable
4. Constitutional concerns if relevant
5. Alternative free-market solutions`,
  
  deep: `Provide a comprehensive libertarian analysis including:
1. All relevant libertarian principles with detailed explanations
2. Thorough critique of government interventions proposed/discussed
3. Austrian economic analysis with focus on unintended consequences
4. Historical examples of similar policies and their outcomes
5. Detailed free-market alternatives
6. Counter-arguments to common objections
7. Supporting sources and references
8. Long-term implications for liberty`
};

// Helper to calculate libertarian score based on principle violations
export function calculateLibertarianScore(principles: LibertarianPrinciple[]): number {
  const weights = { high: 3, medium: 2, low: 1 };
  let totalWeight = 0;
  let alignmentScore = 0;
  
  principles.forEach(principle => {
    const weight = weights[principle.relevance];
    totalWeight += weight;
    
    // Assume explanation contains sentiment about alignment
    // In real implementation, this would be more sophisticated
    const isAligned = !principle.explanation.toLowerCase().includes('violat');
    if (isAligned) {
      alignmentScore += weight;
    }
  });
  
  return totalWeight > 0 ? Math.round((alignmentScore / totalWeight) * 100) : 50;
}
