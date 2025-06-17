import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";
import { PAIR } from "@/lib/abi/pair";

interface PairTotalSupplyResult {
  totalSupply: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for getting total supply from a liquidity pair
 *
 * @param pairAddress - The address of the trading pair
 * @param enabled - Whether the query should be enabled
 * @returns PairTotalSupplyResult with total supply data
 */
export function usePairTotalSupply(
  pairAddress: string,
  enabled: boolean = true
): PairTotalSupplyResult {
  const thor = useThor();

  const {
    data: totalSupply = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pair-total-supply", pairAddress],
    queryFn: async (): Promise<string | null> => {
      if (!thor || !pairAddress) {
        return null;
      }

      const executeTotalSupplyQuery = async () => {
        // Create contract instance for the pair
        const contract = thor.contracts.load(pairAddress, PAIR);

        // Execute totalSupply query
        const result = await contract.read.totalSupply();

        // Convert result to string
        return result ? result.toString() : "0";
      };

      return executeTotalSupplyQuery();
    },
    enabled: Boolean(thor && pairAddress && enabled),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });

  return {
    totalSupply,
    isLoading,
    error: error as Error | null,
  };
} 