import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";
import { FACTORY_ABI } from "@/lib/abi/factory";
import { FACTORY_ADDRESS, TOKEN_CONSTANTS } from "@/lib/token-constants";

// Helper function to replace zero address with BVET
const getEffectiveTokenAddress = (address: string): string => {
  // Replace zero address with BVET address
  return address === "0x0000000000000000000000000000000000000000" 
    ? TOKEN_CONSTANTS.BVET.address 
    : address;
};

interface PairAddressResult {
  pairAddress: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for getting pair address from two token addresses
 *
 * @param tokenA - First token address
 * @param tokenB - Second token address
 * @param enabled - Whether the query should be enabled
 * @returns PairAddressResult with pair address
 */
export function useGetPairAddress(
  tokenA: string,
  tokenB: string,
  enabled: boolean = true
): PairAddressResult {
  const thor = useThor();

  // Get effective addresses (replace zero addresses with BVET)
  const effectiveTokenA = getEffectiveTokenAddress(tokenA);
  const effectiveTokenB = getEffectiveTokenAddress(tokenB);

  const {
    data: pairAddress = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pair-address", effectiveTokenA, effectiveTokenB],
    queryFn: async (): Promise<string | null> => {
      if (!thor || !effectiveTokenA || !effectiveTokenB) {
        return null;
      }

      const executePairAddressQuery = async () => {
        // Create contract instance for the factory
        const contract = thor.contracts.load(FACTORY_ADDRESS, FACTORY_ABI);

        // Execute getPair query with effective addresses
        const result = await contract.read.getPair(effectiveTokenA, effectiveTokenB);

        // Process result
        const pairAddress = Array.isArray(result) 
          ? result[0]?.toString() 
          : result?.toString();

        // Return null if pair doesn't exist (zero address)
        if (!pairAddress || pairAddress === "0x0000000000000000000000000000000000000000") {
          return null;
        }

        return pairAddress;
      };

      return executePairAddressQuery();
    },
    enabled: Boolean(thor && effectiveTokenA && effectiveTokenB && enabled),
    staleTime: 5 * 60 * 1000, // 5 minutes - pair addresses don't change
    retry: 3,
  });

  return {
    pairAddress,
    isLoading,
    error: error as Error | null,
  };
} 