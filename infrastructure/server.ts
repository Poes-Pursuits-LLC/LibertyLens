import { allSecrets } from "./secret";
import { table } from "./table";

export const server = new sst.aws.Function("Server", {
  url: true,
  handler: "app/server/index.handler",
  link: [...allSecrets, table],
});

export const outputs = {
  serverUrl: server.url,
};
