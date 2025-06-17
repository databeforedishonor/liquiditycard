import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";
import { ROUTER_ADDRESS } from "@/lib/token-constants";
import ROUTER_ABI from "@/lib/abi/router";

interface UseQuoteParams {
  inputAmountA: string;
  reserveA: string;
  reserveB: string;
  enabled?: boolean;
}

interface QuoteResult {
  quote: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for quote operations
 * This calculates how much output token you get for a given input amount
 */
export function useQuote({
  inputAmountA,
  reserveA,
  reserveB,
  enabled = true,
}: UseQuoteParams): QuoteResult {
  const thor = useThor();

  const {
    data: quote = "0",
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "quote",
      inputAmountA,
      reserveA,
      reserveB,
    ],
    queryFn: async () => {
      if (!thor || !reserveA || !reserveB || !inputAmountA) {
        return "0";
      }

      // Convert input amount from human-readable to raw format (multiply by decimals)
      const inputAmountRaw = BigInt(Math.floor(parseFloat(inputAmountA) * (10 ** 18)));

      // Create contract instance for the router
      const contract = thor.contracts.load(ROUTER_ADDRESS, ROUTER_ABI);

      // Execute quote query
      const result = await contract.read.quote(
        inputAmountRaw, // amountA - the raw amount of input tokens
        BigInt(reserveA), // reserveA - input token's reserve
        BigInt(reserveB), // reserveB - output token's reserve
      );

      // Return the raw result as string
      if (Array.isArray(result) && result.length > 0) {
        return result[0] ? result[0].toString() : "0";
      } else if (result) {
        return result.toString();
      }

      return "0";
    },
    enabled: Boolean(
      thor &&
      enabled &&
      reserveA &&
      reserveB &&
      inputAmountA &&
      inputAmountA !== "0"
    ),
    staleTime: 10 * 1000, // 10 seconds - quotes should be relatively fresh
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
  });

  return {
    quote,
    isLoading,
    error: error as Error | null,
  };
}
