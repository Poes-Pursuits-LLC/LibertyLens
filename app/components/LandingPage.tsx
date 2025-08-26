import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Link } from "react-router";
import { BackgroundBeams } from "./ui/aceternity/background-beams";
import { TextGenerateEffect } from "./ui/aceternity/text-generate-effect";
import { Spotlight } from "./ui/aceternity/spotlight";
import { MovingBorderButton } from "./ui/aceternity/moving-border";
import { BentoGrid, BentoGridItem } from "./ui/aceternity/bento-grid";
import { InfiniteMovingCards } from "./ui/aceternity/infinite-moving-cards";
import { motion } from "framer-motion";

export function LandingPage() {
  const testimonials = [
    {
      quote:
        "Finally, news analysis that doesn't make me choose between neo-cons and socialists. Liberty Lens shows me what both parties don't want me to see.",
      name: "Sarah M.",
      title: "Entrepreneur & Austrian Economics Enthusiast",
    },
    {
      quote:
        "I've been searching for truly independent news analysis for years. Liberty Lens is the first platform that consistently applies libertarian principles without compromise.",
      name: "Michael R.",
      title: "Software Engineer & Free Market Advocate",
    },
    {
      quote:
        "The AI analysis saves me hours of reading between the lines. It immediately highlights the statist assumptions I would have missed.",
      name: "Jennifer K.",
      title: "Investment Analyst & Crypto Enthusiast",
    },
    {
      quote:
        "Liberty Lens helped me understand economics beyond the mainstream narrative. The Austrian perspective on current events is invaluable.",
      name: "David L.",
      title: "Small Business Owner",
    },
  ];

  return (
    <div className="min-h-screen bg-black dark:bg-black overflow-x-hidden">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/50 border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
                Liberty Lens
              </h1>
            </motion.div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <MovingBorderButton
                  borderRadius="1.75rem"
                  className="bg-slate-900 dark:bg-slate-900 text-white dark:text-white border-neutral-200 dark:border-slate-800 px-6 py-2 text-sm"
                >
                  Get Started
                </MovingBorderButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Spotlight Effect */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black/[0.96] antialiased bg-grid-white/[0.02]">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="blue"
        />
        <div className="relative z-10 w-full pt-20 md:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                Break Free from the
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
                  Media Matrix
                </span>
              </h1>
              <div className="mt-6">
                <TextGenerateEffect
                  words="Tired of statist propaganda disguised as news? Get AI-powered analysis through a principled libertarian lens."
                  className="text-lg md:text-xl text-neutral-300 max-w-3xl mx-auto"
                />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/login">
                  <MovingBorderButton
                    borderRadius="1.75rem"
                    className="bg-slate-900 dark:bg-slate-900 text-white dark:text-white border-neutral-200 dark:border-slate-800 px-8 py-3"
                    duration={3000}
                  >
                    Start Free Trial
                  </MovingBorderButton>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-700 text-gray-300 hover:bg-gray-900"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <BackgroundBeams className="absolute inset-0" />
      </div>

      {/* Pain Points Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-4">
              Sound Familiar?
            </h2>
            <p className="text-lg text-gray-400">The mainstream narrative you're fed every day</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <div className="text-red-500 mb-4">
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
                <h3 className="text-xl font-semibold mb-3 text-white">
                  "Every Crisis Needs More Government"
                </h3>
                <p className="text-gray-400">
                  Mainstream media's solution to every problem is always the same:
                  more regulations, more spending, more control. Where's the
                  perspective that questions expanding state power?
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <div className="text-red-500 mb-4">
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
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Economic Illiteracy Everywhere
                </h3>
                <p className="text-gray-400">
                  Price controls will fix inflation! Print more money! Tax the
                  rich! You're drowning in Keynesian nonsense while Austrian
                  economics gets ignored.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <div className="text-red-500 mb-4">
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
                <h3 className="text-xl font-semibold mb-3 text-white">
                  False Left-Right Paradigm
                </h3>
                <p className="text-gray-400">
                  Team Red vs Team Blue theater while both expand the surveillance
                  state, increase debt, and erode civil liberties. Where's the
                  voice for actual liberty?
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Bento Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
              News Analysis for Free Thinkers
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Liberty Lens cuts through the statist fog with AI-powered analysis
              grounded in libertarian principles
            </p>
          </div>

          <BentoGrid className="max-w-7xl mx-auto">
            <BentoGridItem
              className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800"
              title="Principled Analysis"
              description="Every article filtered through core libertarian principles: NAP, property rights, voluntary exchange, and individual sovereignty."
              icon={
                <svg
                  className="w-8 h-8 text-blue-500"
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
              header={
                <div className="flex justify-center items-center h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                  <div className="text-6xl">⚖️</div>
                </div>
              }
            />
            <BentoGridItem
              className="bg-gradient-to-br from-gray-900 to-gray-800"
              title="Real-Time Analysis"
              description="Get instant libertarian perspective on breaking news."
              icon={
                <svg
                  className="w-8 h-8 text-cyan-500"
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
              }
              header={
                <div className="flex justify-center items-center h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                  <div className="text-4xl">⚡</div>
                </div>
              }
            />
            <BentoGridItem
              className="bg-gradient-to-br from-gray-900 to-gray-800"
              title="Fact-Based Critique"
              description="Austrian economics meets constitutional analysis."
              icon={
                <svg
                  className="w-8 h-8 text-green-500"
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
              header={
                <div className="flex justify-center items-center h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                  <div className="text-4xl">✓</div>
                </div>
              }
            />
            <BentoGridItem
              className="bg-gradient-to-br from-gray-900 to-gray-800"
              title="Customizable Depth"
              description="From quick takes to comprehensive deep dives."
              icon={
                <svg
                  className="w-8 h-8 text-purple-500"
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
              header={
                <div className="flex justify-center items-center h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                  <div className="text-4xl">🎚️</div>
                </div>
              }
            />
            <BentoGridItem
              className="bg-gradient-to-br from-gray-900 to-gray-800"
              title="Transparent Bias"
              description="Honest about our libertarian lens - no hidden agenda."
              icon={
                <svg
                  className="w-8 h-8 text-orange-500"
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
              header={
                <div className="flex justify-center items-center h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg">
                  <div className="text-4xl">🔍</div>
                </div>
              }
            />
          </BentoGrid>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500 mb-16">
            Escape the Echo Chamber in 3 Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <Card className="text-center bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8 h-full">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                >
                  1
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Choose Your Sources
                </h3>
                <p className="text-gray-400">
                  Add mainstream outlets, independent journalists, or niche
                  publications. We'll analyze them all through a consistent
                  libertarian framework.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <Card className="text-center bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8 h-full">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                >
                  2
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  AI Analyzes Every Article
                </h3>
                <p className="text-gray-400">
                  Our AI identifies statist assumptions, economic fallacies, and
                  constitutional violations while highlighting free-market
                  solutions.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <Card className="text-center bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8 h-full">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                >
                  3
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Get Clarity, Not Propaganda
                </h3>
                <p className="text-gray-400">
                  Read the original article alongside principled libertarian
                  analysis. Finally see through the authoritarian narrative.
                </p>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Testimonial Section with Infinite Moving Cards */}
      <section className="py-20 relative bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
            What Liberty Lovers Say
          </h2>
          <p className="text-lg text-gray-400">Join thousands who've found clarity</p>
        </motion.div>
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
          className="mx-auto"
        />
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Ready to Think for Yourself?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          >
            Join thousands who've rejected the false choice between left and
            right authoritarianism.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
          >
            <Link to="/login">
              <MovingBorderButton
                borderRadius="2rem"
                className="bg-white/10 backdrop-blur-md text-white border-white/20 px-8 py-4 text-lg font-semibold hover:bg-white/20 transition-all"
                duration={2000}
              >
                Start Free 14-Day Trial
              </MovingBorderButton>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-sm text-white/70"
          >
            Cancel anytime. We respect your freedom to choose.
          </motion.p>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-0" />
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
