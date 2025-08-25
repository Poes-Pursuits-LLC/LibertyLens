import { Hono } from "hono";
import { feedRouter } from "./routers/feed.router";
import { newsSourceRouter } from "./routers/news-source.router";
import { articleRouter } from "./routers/article.router";
import { analysisRouter } from "./routers/analysis.router";

const main = new Hono()
  .route("/feeds", feedRouter)
  .route("/sources", newsSourceRouter)
  .route("/articles", articleRouter)
  .route("/analyses", analysisRouter);

export type AppType = typeof main;
export { main };
