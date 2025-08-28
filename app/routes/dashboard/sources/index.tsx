import type { Route } from "./+types/index";
import { SourcesPage } from "~/ui/dashboard/sources/SourcesPage";
import { sourcesLoader } from "~/loaders/sources.loader";
import { sourcesAction } from "~/actions/sources.action";

export async function loader(args: Route.LoaderArgs) {
  return await sourcesLoader(args);
}

export async function action(args: Route.ActionArgs) {
  return await sourcesAction(args);
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "News Sources - Liberty Lens" },
    {
      name: "description",
      content: "Discover and add news sources for libertarian analysis",
    },
  ];
}

export default function SourcesRoute({ loaderData }: Route.ComponentProps) {
  return <SourcesPage {...(loaderData as any)} />;
}
