import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";
import { PAIR } from "@/lib/abi/pair";

interface PairReservesData {
  reserve0: string;
  reserve1: string;
}

interface PairReservesResult {
  call: PairReservesData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for getting pair reserves from a liquidity pair
 *
 * @param pairAddress - The address of the trading pair
 * @param enabled - Whether the query should be enabled
 * @returns PairReservesResult with reserves data
 */
export function usePairReserves(
  pairAddress: string,
  enabled: boolean = true
): PairReservesResult {
  const thor = useThor();

  const {
    data: callData = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pair-reserves", pairAddress],
    queryFn: async (): Promise<PairReservesData | null> => {
      if (!thor || !pairAddress) {
        return null;
      }

      const executeReservesQuery = async () => {
        // Create contract instance for the pair
        const contract = thor.contracts.load(pairAddress, PAIR);

        // Execute getReserves query
        const result = await contract.read.getReserves();

        // Process result - getReserves returns [reserve0, reserve1, blockTimestampLast]
        let reserve0 = "0";
        let reserve1 = "0";

        if (Array.isArray(result) && result.length >= 2) {
          reserve0 = result[0] ? result[0].toString() : "0";
          reserve1 = result[1] ? result[1].toString() : "0";
        }

        return {
          reserve0,
          reserve1,
        };
      };

      return executeReservesQuery();
    },
    enabled: Boolean(thor && pairAddress && enabled),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });

  return {
    call: callData,
    isLoading,
    error: error as Error | null,
  };
}
