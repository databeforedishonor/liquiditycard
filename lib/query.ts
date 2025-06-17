import type { QueryKey } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";

/**
 * Defines a query and its dependencies
 */
export interface QueryDependency {
  /** The query key to invalidate */
  queryKey: string[];
  /** Other query keys that should be invalidated before this one */
  dependsOn?: string[][];
}

/**
 * Options for invalidating queries with dependencies
 */
export interface InvalidateQueriesOptions {
  /** The query client to use */
  queryClient: QueryClient;
  /** Queries and their dependencies */
  dependencies: QueryDependency[];
  /** What type of queries to refetch after invalidation */
  refetchType?: "active" | "inactive" | "all" | "none";
}

/**
 * Type for query key factory functions
 */
export type QueryKeyFactory<T extends any[]> = (
  ...args: T
) => readonly string[];
/**
 * Common options for configuring query behavior in hooks
 */
export interface QueryOptions {
  /**
   * Whether to refetch when key dependencies change (like token address)
   */
  refetchOnKeyChange?: boolean;

  /**
   * Time interval in milliseconds for automatic refetching, or false to disable
   */
  refetchInterval?: number | false;

  /**
   * Whether to refetch when window regains focus
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Whether to refetch when component mounts
   */
  refetchOnMount?: boolean;

  /**
   * Whether to retry failed queries, or number of retry attempts
   */
  retry?: boolean | number;

  /**
   * Time in milliseconds that data remains fresh (before becoming stale)
   */
  staleTime?: number;

  /**
   * Time in milliseconds that unused data is kept in cache
   */
  cacheTime?: number;

  /**
   * Custom query key to override the default
   */
  queryKey?: QueryKey;

  /**
   * Override for blockchain revision to use for the call
   */
  blockRevision?: number | string;

  /**
   * Whether the query should execute
   */
  enabled?: boolean;
}
