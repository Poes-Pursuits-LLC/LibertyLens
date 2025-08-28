import type { Route } from "./+types/$feedId";
import { feedArticlesLoader } from "~/loaders/feed-articles.loader";
import { FeedArticlesPage } from "~/ui/feeds/FeedArticlesPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feed Articles - Liberty Lens" },
    { name: "description", content: "View articles in your custom feed" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  return await feedArticlesLoader(args);
}

export default function FeedDetail({ loaderData }: Route.ComponentProps) {
  return <FeedArticlesPage {...loaderData} />;
}
