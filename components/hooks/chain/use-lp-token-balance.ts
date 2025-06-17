import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";
import { PAIR } from "@/lib/abi/pair";

interface LPTokenBalanceParams {
  pairAddress: string;
  userAddress: string;
  enabled?: boolean;
}

interface LPTokenBalanceResult {
  balance: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for getting LP token balance for a specific pair
 * LP tokens are ERC20 tokens issued by the pair contract itself
 *
 * @param pairAddress - The address of the trading pair (which is also the LP token contract)
 * @param userAddress - The user's wallet address
 * @param enabled - Whether the query should be enabled
 * @returns LPTokenBalanceResult with balance data
 */
export function useLPTokenBalance({
  pairAddress,
  userAddress,
  enabled = true
}: LPTokenBalanceParams): LPTokenBalanceResult {
  const thor = useThor();

  const {
    data: balance = "0",
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lp-token-balance", userAddress, pairAddress],
    queryFn: async () => {
      if (!thor || !userAddress || !pairAddress) {
        return "0";
      }

      const executeLPBalanceQuery = async () => {
        // Create contract instance for the pair (which is also the LP token contract)
        const contract = thor.contracts.load(pairAddress, PAIR);

        // Execute balance query - LP tokens implement ERC20 balanceOf
        const result = await contract.read.balanceOf(userAddress);

        // Process result
        let processedBalance = "0";
        
        if (Array.isArray(result) && result.length > 0) {
          processedBalance = result[0] ? result[0].toString() : "0";
        } else if (result) {
          processedBalance = result.toString();
        }
 
        return processedBalance;
      };

      return executeLPBalanceQuery();
    },
    enabled: Boolean(thor && userAddress && pairAddress && enabled),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });

  return {
    balance,
    isLoading,
    error: error as Error | null,
  };
} 