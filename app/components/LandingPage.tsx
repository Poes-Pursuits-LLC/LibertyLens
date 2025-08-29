import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Link } from "react-router";
import { Spotlight as MinimalSpotlight } from "./../components/effects/Spotlight";
import { Spotlight as AceternitySpotlight } from "./ui/aceternity/spotlight";
import { TextGenerateEffect } from "./ui/aceternity/text-generate-effect";
import { BentoGrid, BentoGridItem } from "./ui/aceternity/bento-grid";
import { InfiniteMovingCards } from "./ui/aceternity/infinite-moving-cards";
import { BackgroundBeams } from "./ui/aceternity/background-beams";
import { MovingBorderButton } from "./ui/aceternity/moving-border";
import { FloatingElements } from "./ui/aceternity/floating-elements";
import { ShimmerBorder } from "./ui/aceternity/shimmer-border";
import { GradientBlur } from "./ui/aceternity/gradient-blur";
import { TypewriterEffect } from "./ui/aceternity/typewriter-effect";
import { GradientHeading } from "./ui/aceternity/gradient-heading";
import { MotionCard } from "./ui/aceternity/motion-card";
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
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text)] overflow-x-hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-3.5 focus:py-2.5 focus:rounded-md focus:bg-[var(--surface-2)] focus:text-[var(--text)] focus:shadow"
      >
        Skip to content
      </a>

      {/* Navigation Bar */}
      <nav
        aria-label="Primary"
        className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/70 border-b border-black/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold tracking-tight">Liberty Lens</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hover:bg-[var(--surface-2)]">
                  Sign In
                </Button>
              </Link>
              <Link to="/login" className="inline-flex">
                <span className="btn-minimal focus-visible:ring-2 focus-visible:ring-[var(--accent)]">Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main id="main">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <AceternitySpotlight className="-z-10 opacity-40" />
        <MinimalSpotlight className="-z-10 opacity-35" color="oklch(80% 0.09 240 / 0.35)" />
        <GradientBlur className="-z-10 opacity-30" colors={["#3B82F6", "#A855F7", "#EC4899"]} />
        <div className="relative mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32">
          <div className="max-w-3xl text-center mx-auto">
            <div className="flex justify-center gap-1 mb-1">
              <TypewriterEffect 
                words={["Truth", "Freedom", "Analysis", "Understanding"]} 
                className="text-[var(--accent)] font-semibold text-xl md:text-2xl mt-1" 
              />
            </div>
            <GradientHeading
              as="h1"
              className="text-4xl md:text-6xl font-semibold tracking-tight"
              gradientFrom="from-blue-600"
              gradientVia="via-indigo-600"
              gradientTo="to-purple-600"
            >
              Cut Through the Narrative, Find the Truth
            </GradientHeading>
            <TextGenerateEffect
              words="Break free from algorithmic echo chambers and media manipulation. Get unbiased analysis that respects your intelligence and individual judgment."
              className="mt-5 text-base md:text-lg leading-7 muted"
            />
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="inline-flex">
                <MovingBorderButton
                  borderRadius="0.75rem"
                  className="bg-[var(--text)] text-[var(--accent-contrast)] px-6 py-3 font-medium"
                  containerClassName="bg-transparent"
                  borderClassName="bg-gradient-to-r from-[var(--accent)] to-blue-500"
                  duration={3000}
                >
                  Start Free Trial
                </MovingBorderButton>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="border-black/15 hover:bg-[var(--surface-2)] backdrop-blur"
                aria-label="Watch demo"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 md:py-20 px-6 md:px-8 bg-[var(--surface)]" aria-labelledby="pain-points">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="pain-points" className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              Escape the Information Prison
            </h2>
            <p className="mt-3 text-lg muted">Why independent minds need better tools to navigate today's media landscape</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ShimmerBorder className="rounded-xl" duration={5} shimmerColor="rgba(0,0,0,0.08)">
              <MotionCard className="soft-card rounded-xl p-8 h-full">
                <div className="mb-4 accent" aria-hidden="true">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Corporate Media Gatekeeping</h3>
                <p className="muted">Legacy outlets push approved narratives while Big Tech algorithms suppress dissenting voices. Your feed becomes your prison.</p>
              </MotionCard>
            </ShimmerBorder>
            <ShimmerBorder className="rounded-xl" duration={5} shimmerColor="rgba(0,0,0,0.07)">
              <MotionCard className="soft-card rounded-xl p-8 h-full">
                <div className="mb-4 accent" aria-hidden="true">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Manufactured Consensus</h3>
                <p className="muted">"Experts" and "fact-checkers" shield questionable claims from scrutiny. Independent verification becomes nearly impossible.</p>
              </MotionCard>
            </ShimmerBorder>
            <ShimmerBorder className="rounded-xl" duration={5} shimmerColor="rgba(0,0,0,0.06)">
              <MotionCard className="soft-card rounded-xl p-8 h-full">
                <div className="mb-4 accent" aria-hidden="true">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Information Overload by Design</h3>
                <p className="muted">Endless noise drowns out signal. Complex stories get oversimplified while trivial scandals dominate cycles.</p>
              </MotionCard>
            </ShimmerBorder>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-6 md:px-8 bg-[var(--surface)] relative overflow-hidden" aria-labelledby="features">
        <FloatingElements className="-z-10" count={12} color="rgba(0, 0, 0, 0.08)" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="features" className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              Tools for Independent Thinkers
            </h2>
            <p className="mt-3 text-lg muted max-w-3xl mx-auto">Cut through propaganda with AI that respects your ability to think for yourself.</p>
          </div>
          <BentoGrid className="gap-6">
            <BentoGridItem
              className="soft-card p-6"
              icon={
                <div className="mb-3 accent" aria-hidden="true">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
              }
              title="Break the Echo Chamber"
              description="See how different sources frame the same events. Spot the patterns in narrative control."
            />
            <BentoGridItem
              className="soft-card p-6"
              icon={
                <div className="mb-3 accent" aria-hidden="true">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              }
              title="Decode the Spin"
              description="AI analysis reveals loaded language, emotional manipulation, and missing context in real-time."
            />
            <BentoGridItem
              className="soft-card p-6"
              icon={
                <div className="mb-3 accent" aria-hidden="true">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
              title="Trust But Verify"
              description="Every claim traced to original sources. No appeals to authority—judge the evidence yourself."
            />
            <BentoGridItem
              className="soft-card p-6"
              icon={
                <div className="mb-3 accent" aria-hidden="true">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
              }
              title="Historical Context"
              description="Understand the deeper patterns and incentives behind today's headlines. Connect the dots."
            />
            <BentoGridItem
              className="soft-card p-6"
              icon={
                <div className="mb-3 accent" aria-hidden="true">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
              title="Signal Over Noise"
              description="Cut through the distraction. Get the essential facts without the emotional manipulation."
            />
          </BentoGrid>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 px-6 md:px-8 bg-[var(--surface)] relative overflow-hidden" aria-labelledby="how-it-works">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--surface-2),transparent)]" />
        <div className="max-w-7xl mx-auto">
          <h2 id="how-it-works" className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-center mb-12">
            Reclaim Your Intellectual <span className="text-[var(--accent)]">Freedom</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <MotionCard>
              <Card className="text-center soft-card p-8 h-full rounded-xl">
                <div className="w-16 h-16 bg-[var(--surface-2)] text-[var(--text)] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold border border-black/10" aria-hidden="true">
                  1
                </div>
              <h3 className="text-xl font-semibold mb-3">Curate Your Intelligence</h3>
              <p className="muted">Select sources across the spectrum—mainstream, alternative, and independent. No algorithmic curation.</p>
            </Card>
            </MotionCard>
            <MotionCard>
              <Card className="text-center soft-card p-8 h-full rounded-xl">
                <div className="w-16 h-16 bg-[var(--surface-2)] text-[var(--text)] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold border border-black/10" aria-hidden="true">
                  2
                </div>
              <h3 className="text-xl font-semibold mb-3">Unbiased Analysis</h3>
              <p className="muted">AI trained on logic and evidence—not political correctness. Identifies manipulation tactics and missing context.</p>
            </Card>
            </MotionCard>
            <MotionCard>
              <Card className="text-center soft-card p-8 h-full rounded-xl">
                <div className="w-16 h-16 bg-[var(--surface-2)] text-[var(--text)] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold border border-black/10" aria-hidden="true">
                  3
                </div>
              <h3 className="text-xl font-semibold mb-3">Think for Yourself</h3>
              <p className="muted">Armed with facts and context, form your own opinions. No pre-digested conclusions or "approved" narratives.</p>
            </Card>
            </MotionCard>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 px-6 md:px-8 bg-[var(--surface)] relative overflow-hidden" aria-labelledby="testimonials">
        <BackgroundBeams className="-z-10 opacity-[0.03]" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 id="testimonials" className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Free Minds, Free Markets</h2>
            <p className="mt-3 text-lg muted">Join independent thinkers who've broken free from the narrative</p>
          </div>
          {/* Aceternity Infinite Moving Cards */}
          <InfiniteMovingCards
            items={testimonials}
            speed="normal"
            direction="left"
            className="mt-2"
          />
          {/* Static fallback for ultra-small screens or if JS disabled */}
          <noscript>
            <div className="grid gap-6 md:grid-cols-2 mt-6">
              {testimonials.map((t, idx) => (
                <div key={idx} className="soft-card rounded-xl p-6 text-left">
                  <blockquote className="text-base md:text-lg">“{t.quote}”</blockquote>
                  <footer className="mt-4 text-sm muted">— {t.name}, {t.title}</footer>
                </div>
              ))}
            </div>
          </noscript>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-6 md:px-8 bg-[var(--surface-2)] relative overflow-hidden" aria-labelledby="cta">
        <BackgroundBeams className="opacity-[0.05]" />
        <GradientBlur className="-z-10 opacity-25" colors={["#3B82F6", "#06B6D4", "#6366F1"]} animated={true} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 id="cta" className="text-3xl sm:text-4xl font-semibold tracking-tight">Break Free from the Matrix</h2>
          <p className="mt-4 text-lg muted max-w-2xl mx-auto">
            Stop consuming pre-packaged opinions. Start thinking independently with tools built for free minds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="inline-flex">
              <MovingBorderButton
                borderRadius="0.75rem"
                className="bg-[var(--text)] text-[var(--accent-contrast)] px-8 py-3 font-medium"
                containerClassName="bg-transparent"
                borderClassName="bg-gradient-to-r from-[var(--accent)] to-blue-500"
                duration={3000}
              >
                Start Free Trial
              </MovingBorderButton>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-black/15 hover:bg-[var(--surface)] backdrop-blur">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm muted">No contracts. No censorship. Your mind, your choice.</p>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-8 bg-[var(--surface)] border-t border-black/5 text-[var(--text)]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-4">
            Liberty Lens - Because free minds deserve better than manufactured consent.
          </p>
          <p className="text-sm muted">© 2024 Liberty Lens. Built by independent thinkers, for independent thinkers.</p>
        </div>
      </footer>
    </div>
  );
}
