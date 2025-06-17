import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";
import { usePairReserves } from "./chain/use-pair-reserves";
import { useGetPairTokens } from "./chain/use-get-pair-tokens";
import { ROUTER_ADDRESS } from "@/lib/token-constants";
import ROUTER_ABI from "@/lib/abi/router";

interface UseQuoteParams {
  pairAddress: string;
  inputAmount: string;
  inputTokenAddress: string;
  outputTokenAddress: string;
  inputTokenDecimals: number;
  outputTokenDecimals: number;
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
 *
 * @param pairAddress - The address of the trading pair
 * @param inputAmount - The raw amount of input token
 * @param inputTokenAddress - The address of the input token
 * @param outputTokenAddress - The address of the output token
 * @param enabled - Whether the query should be enabled
 * @returns QuoteResult with quote data
 */
export function useQuote({
  pairAddress,
  inputAmount,
  inputTokenAddress,
  outputTokenAddress,
  inputTokenDecimals,
  outputTokenDecimals,
  enabled = true,
}: UseQuoteParams): QuoteResult {
  const thor = useThor();

  // Get pair tokens to know which is token0 and token1
  const {
    tokens: pairTokens,
    isLoading: pairTokensLoading,
    error: pairTokensError,
  } = useGetPairTokens(pairAddress, Boolean(pairAddress));

  // Get pair reserves
  const {
    call: reservesData,
    isLoading: reservesLoading,
    error: reservesError,
  } = usePairReserves(pairAddress);

  // Check if we have valid reserves data
  const hasValidReserves =
    reservesData &&
    reservesData.reserve0 &&
    reservesData.reserve1 &&
    reservesData.reserve0 !== "0" &&
    reservesData.reserve1 !== "0";

  // Determine which token is the input and match with reserves
  const isInputToken0 = pairTokens && pairTokens.token0.toLowerCase() === inputTokenAddress.toLowerCase();
  const inputReserve = isInputToken0 ? reservesData?.reserve0 : reservesData?.reserve1;
  const outputReserve = isInputToken0 ? reservesData?.reserve1 : reservesData?.reserve0;

  const {
    data: quote = "0",
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "quote",
      inputAmount,
      inputTokenAddress,
      outputTokenAddress,
      inputTokenDecimals,
      outputTokenDecimals,
      inputReserve,
      outputReserve,
    ],
    queryFn: async () => {
      if (!thor || !hasValidReserves || !inputAmount || inputAmount === "0" || !inputReserve || !outputReserve) {
        return "0";
      }

      const executeQuoteQuery = async () => {
        // Convert input amount from human-readable to raw format (multiply by decimals)
        const inputAmountRaw = BigInt(Math.floor(parseFloat(inputAmount) * (10 ** inputTokenDecimals)));

        // Create contract instance for the router
        const contract = thor.contracts.load(ROUTER_ADDRESS, ROUTER_ABI);

        // Execute quote query
        // amountA = input amount (raw format)
        // reserveA = input token's reserve
        // reserveB = output token's reserve
        const result = await contract.read.quote(
          inputAmountRaw, // amountA - the raw amount of input tokens
          BigInt(inputReserve), // reserveA - input token's reserve
          BigInt(outputReserve), // reserveB - output token's reserve
        );
        console.log("result", result);

        // Process result and convert back to human-readable format
        let processedQuote = "0";
        
        if (Array.isArray(result) && result.length > 0) {
          const rawQuote = result[0] ? BigInt(result[0].toString()) : BigInt(0);
          // Convert from raw format to human-readable (divide by output token decimals)
          const humanReadableQuote = Number(rawQuote) / (10 ** outputTokenDecimals);
          processedQuote = humanReadableQuote.toString();
        } else if (result) {
          const rawQuote = BigInt(result.toString());
          // Convert from raw format to human-readable (divide by output token decimals)
          const humanReadableQuote = Number(rawQuote) / (10 ** outputTokenDecimals);
          processedQuote = humanReadableQuote.toString();
        }

        return processedQuote;
      };

      return executeQuoteQuery();
    },
    enabled: Boolean(
      thor &&
      enabled &&
      hasValidReserves &&
      pairTokens &&
      inputAmount &&
      inputAmount !== "0" &&
      inputTokenAddress &&
      outputTokenAddress &&
      !reservesLoading &&
      !reservesError &&
      !pairTokensLoading &&
      !pairTokensError
    ),
    staleTime: 10 * 1000, // 10 seconds - quotes should be relatively fresh
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
  });

  return {
    quote,
    isLoading: isLoading || reservesLoading || pairTokensLoading,
    error: (error as Error | null) || reservesError || pairTokensError,
  };
}
