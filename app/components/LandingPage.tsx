import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Hero } from "./ui/Hero";
import { Feature } from "./ui/Feature";
import { Link } from "react-router";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Capitol Background */}
      <div className="relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1555992643-a97955e6aae2?w=1920&h=600&fit=crop&crop=focalpoint&fp-y=.4"
            alt="US Capitol Building"
            className="w-full h-full object-cover opacity-20 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-gray-50/70 to-gray-50 dark:from-gray-900/50 dark:via-gray-900/70 dark:to-gray-900" />
        </div>
        <Hero
          title={
            <>
              Break Free from the
              <span className="text-blue-600 dark:text-blue-400">
                {" "}
                Media Matrix
              </span>
            </>
          }
          subtitle="Tired of statist propaganda disguised as news? Get AI-powered analysis through a principled libertarian lens."
          className="relative z-10"
        >
          <Link to="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
          <Button variant="secondary" size="lg">
            See How It Works
          </Button>
        </Hero>
      </div>

      {/* Pain Points Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Sound Familiar?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <img
                  src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=400&h=400&fit=crop"
                  alt="Government building"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-red-600 mb-4 relative z-10">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white relative z-10">
                "Every Crisis Needs More Government"
              </h3>
              <p className="text-gray-600 dark:text-gray-400 relative z-10">
                Mainstream media's solution to every problem is always the same:
                more regulations, more spending, more control. Where's the
                perspective that questions expanding state power?
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <img
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop"
                  alt="Stock market display"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-red-600 mb-4 relative z-10">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white relative z-10">
                Economic Illiteracy Everywhere
              </h3>
              <p className="text-gray-600 dark:text-gray-400 relative z-10">
                Price controls will fix inflation! Print more money! Tax the
                rich! You're drowning in Keynesian nonsense while Austrian
                economics gets ignored.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <img
                  src="https://images.unsplash.com/photo-1551817958-11e0f7bbea9c?w=400&h=400&fit=crop"
                  alt="Political party symbols"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-red-600 mb-4 relative z-10">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white relative z-10">
                False Left-Right Paradigm
              </h3>
              <p className="text-gray-600 dark:text-gray-400 relative z-10">
                Team Red vs Team Blue theater while both expand the surveillance
                state, increase debt, and erode civil liberties. Where's the
                voice for actual liberty?
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            News Analysis for Free Thinkers
          </h2>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto">
            Liberty Lens cuts through the statist fog with AI-powered analysis
            grounded in libertarian principles
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature
              icon={
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              }
              title="Principled Analysis"
              description="Every article filtered through core libertarian principles: NAP, property rights, voluntary exchange, and individual sovereignty"
            />

            <Feature
              icon={
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Fact-Based Critique"
              description="No partisan hackery. Just Austrian economics, constitutional analysis, and logical consistency checking"
            />

            <Feature
              icon={
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              }
              title="Customizable Depth"
              description="From quick takes to deep dives. Choose how thoroughly you want the state's narrative deconstructed"
            />

            <Feature
              icon={
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Transparent Bias"
              description="We're upfront about our libertarian lens. No hidden agenda, just honest philosophical consistency"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1920&h=800&fit=crop"
            alt="American flag background"
            className="w-full h-full object-cover opacity-5 dark:opacity-5"
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Escape the Echo Chamber in 3 Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Choose Your Sources
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add mainstream outlets, independent journalists, or niche
                publications. We'll analyze them all through a consistent
                libertarian framework.
              </p>
            </div>

            <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                AI Analyzes Every Article
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI identifies statist assumptions, economic fallacies, and
                constitutional violations while highlighting free-market
                solutions.
              </p>
            </div>

            <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Get Clarity, Not Propaganda
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Read the original article alongside principled libertarian
                analysis. Finally see through the authoritarian narrative.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white mb-8">
            "Finally, news analysis that doesn't make me choose between
            <span className="text-blue-600 dark:text-blue-400">
              {" "}
              neo-cons and socialists
            </span>
            . Liberty Lens shows me what both parties don't want me to see."
          </blockquote>
          <cite className="text-gray-600 dark:text-gray-400">
            — Sarah M., Entrepreneur & Austrian Economics Enthusiast
          </cite>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1422464804701-7d8356b3a42f?w=1920&h=600&fit=crop"
            alt="We The People Constitution"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Think for Yourself?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands who've rejected the false choice between left and
            right authoritarianism.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Free 14-Day Trial
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-white hover:bg-blue-700"
            >
              No Credit Card Required
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-6">
            Cancel anytime. We respect your freedom to choose.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">
            Liberty Lens - Because mainstream media forgot that government isn't
            the solution.
          </p>
          <p className="text-sm">
            © 2024 Liberty Lens. Built by libertarians, for libertarians.
          </p>
        </div>
      </footer>
    </div>
  );
}
