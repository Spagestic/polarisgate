/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as CustomPassword from "../CustomPassword.js";
import type * as auth from "../auth.js";
import type * as destinations from "../destinations.js";
import type * as firecrawl_agent from "../firecrawl/agent.js";
import type * as firecrawl_client from "../firecrawl/client.js";
import type * as firecrawl_crawl from "../firecrawl/crawl.js";
import type * as firecrawl_interact from "../firecrawl/interact.js";
import type * as firecrawl_map from "../firecrawl/map.js";
import type * as firecrawl_scrape from "../firecrawl/scrape.js";
import type * as firecrawl_search from "../firecrawl/search.js";
import type * as http from "../http.js";
import type * as immigrationAgent from "../immigrationAgent.js";
import type * as pathways from "../pathways.js";
import type * as pinnedCountries from "../pinnedCountries.js";
import type * as profiles from "../profiles.js";
import type * as research from "../research.js";
import type * as researchJobs from "../researchJobs.js";
import type * as searchHistory from "../searchHistory.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  auth: typeof auth;
  destinations: typeof destinations;
  "firecrawl/agent": typeof firecrawl_agent;
  "firecrawl/client": typeof firecrawl_client;
  "firecrawl/crawl": typeof firecrawl_crawl;
  "firecrawl/interact": typeof firecrawl_interact;
  "firecrawl/map": typeof firecrawl_map;
  "firecrawl/scrape": typeof firecrawl_scrape;
  "firecrawl/search": typeof firecrawl_search;
  http: typeof http;
  immigrationAgent: typeof immigrationAgent;
  pathways: typeof pathways;
  pinnedCountries: typeof pinnedCountries;
  profiles: typeof profiles;
  research: typeof research;
  researchJobs: typeof researchJobs;
  searchHistory: typeof searchHistory;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
