import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";
import { ERC20_ABI } from "@vechain/sdk-core";
import { TOKEN_CONSTANTS } from "@/lib/token-constants";

interface TokenBalanceParams {
  tokenAddress: string;
  userAddress: string;
  enabled?: boolean;
  debug?: boolean;
}

interface TokenBalanceResult {
  balance: string;
  isLoading: boolean;
  error: Error | null;
}

interface AllTokenBalancesResult {
  balances: Record<string, string>; // tokenAddress -> balance
  isLoading: boolean;
  error: Error | null;
}

export function useTokenBalance({
  tokenAddress,
  userAddress,
  enabled = true
}: TokenBalanceParams): TokenBalanceResult {
  const thor = useThor();

  const {
    data: balance = "0",
    isLoading,
    error,
  } = useQuery({
    queryKey: ["token-balance", userAddress, tokenAddress],
    queryFn: async () => {
      if (!thor || !userAddress || !tokenAddress) {
        return "0";
      }

      const executeBalanceQuery = async () => {
        // Create contract instance for the token
        const contract = thor.contracts.load(tokenAddress, ERC20_ABI);

        // Execute balance query
        const result = await contract.read.balanceOf(userAddress);

        // Process result
        let processedBalance = "0";
        
        if (Array.isArray(result) && result.length > 0) {
          processedBalance = result[0] ? result[0].toString() : "0";
        } else if (result) {
          processedBalance = result.toString();
        
 
        return processedBalance;
      };
        return executeBalanceQuery();
      }
    },
    enabled: Boolean(thor && userAddress && tokenAddress && enabled),
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

export function useAllTokenBalances({
  userAddress,
  debug = false,
}: {
  userAddress: string;
  debug?: boolean;
}): AllTokenBalancesResult {
  const thor = useThor();

  // Get all ERC20 token addresses (excluding VET)
  const erc20TokenAddresses = Object.values(TOKEN_CONSTANTS)
    .filter(token => token.symbol !== "VET")
    .map(token => token.address);

  const {
    data: balances = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["all-token-balances", userAddress],
    queryFn: async () => {
      if (!thor || !userAddress) {
        return {};
      }

      const executeAllBalancesQuery = async () => {

        // Create contract instances for each token
        const contracts = erc20TokenAddresses.map((tokenAddress) =>
          thor.contracts.load(tokenAddress, ERC20_ABI)
        );

        // Build balance query clauses for all tokens
        const balanceOfClauses = contracts.map((contract) =>
          contract.clause.balanceOf(userAddress)
        );
        // Execute all balance queries in a single call
        const results = await thor.contracts.executeMultipleClausesCall(
          balanceOfClauses
        );

        // Process results and create balance map
        const balanceMap: Record<string, string> = {};
  
        results.forEach((result, index) => {
          const tokenAddress = erc20TokenAddresses[index];
              
          try {
            // Extract balance from result - handle both plain and array formats
            const resultData = result.result;
            let balance = "0";
            
            if (resultData?.array && Array.isArray(resultData.array)) {
              balance = resultData.array[0] ? resultData.array[0].toString() : "0";
            } else if (resultData?.plain) {
              balance = resultData.plain.toString();
            }

            balanceMap[tokenAddress] = balance;
            
          } catch (decodeError) {
            balanceMap[tokenAddress] = "0";
          }
        });

        return balanceMap;
      };

        return executeAllBalancesQuery();
    },
    enabled: Boolean(thor && userAddress),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });

  return {
    balances,
    isLoading,
    error: error as Error | null,
  };
}
