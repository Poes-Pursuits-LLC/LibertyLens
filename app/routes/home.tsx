import type { Route } from "./+types/home";
import { LandingPage } from "../components/LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Liberty Lens - AI-Powered News Analysis for Libertarians" },
    { name: "description", content: "Break free from mainstream media propaganda. Get news analyzed through a principled libertarian lens with AI-powered insights." },
  ];
}

export default function Home() {
  return <LandingPage />;
}
