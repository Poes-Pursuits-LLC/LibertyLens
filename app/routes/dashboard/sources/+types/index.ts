import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export namespace Route {
  export type ActionArgs = ActionFunctionArgs;
  export type LoaderArgs = LoaderFunctionArgs;
  export type MetaArgs = { params: any; data: any };

  // Define return types for actions and loaders
  export type ActionData = {
    error?: string;
    success?: boolean;
    data?: any;
  };

  export type LoaderData = {
    sources: any[];
    count: number;
    categories: string[];
    error?: string;
  };
}
