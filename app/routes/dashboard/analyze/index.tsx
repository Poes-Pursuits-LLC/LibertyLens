import type { Route } from "./+types/index";
import { useState } from "react";
import { 
  SparklesIcon,
  LinkIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Analyze Article - Liberty Lens" },
    { name: "description", content: "Get AI-powered libertarian analysis of any news article" },
  ];
}

// Mock analysis result
const mockAnalysis = {
  title: "Federal Reserve Raises Interest Rates by 0.25%",
  source: "Wall Street Journal",
  author: "Jane Doe",
  publishedDate: "March 15, 2024",
  url: "https://wsj.com/example-article",
  libertarianScore: 25,
  summary: "The Federal Reserve announced another quarter-point interest rate increase, citing persistent inflation concerns and labor market strength.",
  keyPoints: [
    "Central planning of interest rates distorts market signals",
    "Artificial rate manipulation creates boom-bust cycles",
    "Free market would naturally determine optimal interest rates",
    "Fed policy benefits large banks at expense of savers",
  ],
  principles: [
    {
      name: "Free Markets",
      relevance: "high",
      explanation: "Interest rates should be determined by supply and demand for capital, not central committees",
    },
    {
      name: "Sound Money",
      relevance: "high", 
      explanation: "Monetary manipulation erodes purchasing power and enables government deficit spending",
    },
    {
      name: "Limited Government",
      relevance: "medium",
      explanation: "Federal Reserve represents massive government intervention in the economy",
    },
  ],
  analysis: `This Federal Reserve decision exemplifies the fundamental problems with central economic planning. By artificially manipulating interest rates, the Fed distorts the most important price signal in the economy - the price of money itself.

From an Austrian economics perspective, this intervention prevents the natural discovery process that would occur in a free market. Entrepreneurs and investors are making decisions based on false signals, leading to malinvestment and eventual economic correction.

The Fed claims to be fighting inflation, yet it was their own monetary expansion that created the inflation in the first place. This is the inevitable result of fiat currency systems where government can create money at will.

A truly free market would allow interest rates to be determined by the time preferences of savers and borrowers, ensuring sustainable economic growth rather than artificial booms followed by painful busts.`,
  alternatives: [
    "End the Federal Reserve and return to market-based interest rates",
    "Adopt a gold standard to prevent monetary manipulation",
    "Allow competing currencies to give people monetary choice",
    "At minimum, audit the Fed and increase transparency",
  ],
};

export default function AnalyzeIndex() {
  const [articleUrl, setArticleUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleReset = () => {
    setArticleUrl("");
    setAnalysis(null);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analyze Article
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Get AI-powered libertarian perspective on any news article
        </p>
      </div>

      {!analysis ? (
        <>
          {/* Input Form */}
          <Card className="p-6">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label htmlFor="articleUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Article URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    id="articleUrl"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    placeholder="https://example.com/article"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Analyze Article
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* How it works */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Paste Article URL</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter the URL of any news article you want analyzed
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">AI Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our AI reads the article and analyzes it through libertarian principles
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Get Insights</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive comprehensive libertarian perspective with key principles and alternatives
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Analyses */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Analyses
            </h2>
            <div className="space-y-3">
              {[
                { title: "New Cryptocurrency Regulations Proposed", source: "Reuters", score: 15, time: "2 hours ago" },
                { title: "State Reduces Occupational Licensing Requirements", source: "Local News", score: 85, time: "5 hours ago" },
                { title: "Congress Debates Military Budget Increase", source: "AP News", score: 20, time: "1 day ago" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.source} • {item.time}</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    item.score >= 70 ? 'text-green-600' : 
                    item.score >= 40 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <>
          {/* Analysis Results */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analysis.title}
                </h2>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{analysis.source}</span>
                  <span>•</span>
                  <span>{analysis.author}</span>
                  <span>•</span>
                  <span>{analysis.publishedDate}</span>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  analysis.libertarianScore >= 70 ? 'text-green-600' : 
                  analysis.libertarianScore >= 40 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {analysis.libertarianScore}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Liberty Score</div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{analysis.summary}</p>

              <h3 className="text-lg font-semibold flex items-center gap-2 mt-6">
                <LightBulbIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Key Libertarian Points
              </h3>
              <ul className="space-y-2">
                {analysis.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-semibold mt-6">Relevant Principles</h3>
              <div className="space-y-4">
                {analysis.principles.map((principle, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{principle.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        principle.relevance === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                        principle.relevance === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {principle.relevance} relevance
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{principle.explanation}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-6">Full Analysis</h3>
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {analysis.analysis}
              </div>

              <h3 className="text-lg font-semibold mt-6">Libertarian Alternatives</h3>
              <ul className="space-y-2">
                {analysis.alternatives.map((alt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">→</span>
                    <span className="text-gray-700 dark:text-gray-300">{alt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <a 
                href={analysis.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                View Original Article
              </a>
              <Button variant="secondary" onClick={handleReset}>
                Analyze Another Article
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
