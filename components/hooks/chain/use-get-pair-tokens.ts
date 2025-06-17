import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";
import { PAIR } from "@/lib/abi/pair";

interface PairTokensData {
  token0: string;
  token1: string;
}

interface PairTokensResult {
  tokens: PairTokensData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for getting pair token addresses
 *
 * @param pairAddress - The address of the trading pair
 * @param enabled - Whether the query should be enabled
 * @returns PairTokensResult with token addresses
 */
export function useGetPairTokens(
  pairAddress: string,
  enabled: boolean = true
): PairTokensResult {
  const thor = useThor();

  const {
    data: tokens = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pair-tokens", pairAddress],
    queryFn: async (): Promise<PairTokensData | null> => {
      if (!thor || !pairAddress) {
        return null;
      }

      const executePairTokensQuery = async () => {
        // Create contract instance for the pair
        const contract = thor.contracts.load(pairAddress, PAIR);

        // Execute both token queries
        const [token0Result, token1Result] = await Promise.all([
          contract.read.token0(),
          contract.read.token1(),
        ]);

        // Process results
        const token0 = Array.isArray(token0Result) ? token0Result[0]?.toString() : token0Result?.toString();
        const token1 = Array.isArray(token1Result) ? token1Result[0]?.toString() : token1Result?.toString();

        return {
          token0: token0 || "",
          token1: token1 || "",
        };
      };

      return executePairTokensQuery();
    },
    enabled: Boolean(thor && pairAddress && enabled),
    staleTime: 5 * 60 * 1000, // 5 minutes - token addresses don't change
    retry: 3,
  });

  return {
    tokens,
    isLoading,
    error: error as Error | null,
  };
} 