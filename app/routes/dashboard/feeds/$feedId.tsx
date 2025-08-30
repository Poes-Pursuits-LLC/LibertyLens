import type { Route } from "./+types/$feedId";
import { feedArticlesLoader } from "~/loaders/feed-articles.loader";
import { feedArticlesAction } from "~/actions/feed-articles.action";
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

export async function action(args: Route.ActionArgs) {
  return await feedArticlesAction(args);
}

export default function FeedDetail({ loaderData, actionData }: Route.ComponentProps) {
  return <FeedArticlesPage loaderData={loaderData} actionData={actionData} />;
}
