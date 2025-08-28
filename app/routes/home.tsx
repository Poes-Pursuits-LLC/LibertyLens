import type { Route } from "./+types/home";
import { LandingPage } from "../components/LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Liberty Lens — Compare Coverage, Verify Claims, Decide for Yourself" },
    { name: "description", content: "A cleaner, more balanced news dashboard. Compare how multiple outlets cover the same story, see bias and tone indicators, verify claims with sources, and read concise context cards." },
  ];
}

export default function Home() {
  return <LandingPage />;
}
