import { useQuery } from "@tanstack/react-query";
import { useThor } from "@vechain/dapp-kit-react";

interface TransactionReceipt {
  txID: string;
  txOrigin: string;
  gasUsed: number;
  gasPayer: string;
  paid: string;
  reward: string;
  reverted: boolean;
  meta: {
    blockID: string;
    blockNumber: number;
    blockTimestamp: number;
  };
  outputs: Array<{
    contractAddress?: string;
    events: Array<{
      address: string;
      topics: string[];
      data: string;
    }>;
    transfers: Array<{
      sender: string;
      recipient: string;
      amount: string;
    }>;
  }>;
}

interface UseTxReceiptResult {
  receipt: TransactionReceipt | null;
  isLoading: boolean;
  error: Error | null;
  isConfirmed: boolean;
  isReverted: boolean;
}

/**
 * Hook for polling transaction receipts
 * 
 * @param txId - Transaction ID to poll for
 * @param enabled - Whether polling should be enabled
 * @returns Transaction receipt data and status
 */
export function useTxReceipt(
  txId: string | undefined,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  } = {}
): UseTxReceiptResult {
  const {
    enabled = true,
    refetchInterval = 2000, // Poll every 2 seconds
    staleTime = Infinity,
  } = options;

  const thor = useThor();

  const {
    data: receipt,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tx-receipt", txId],
    queryFn: async (): Promise<TransactionReceipt | null> => {
      if (!thor || !txId) {
        return null;
      }

      try {
        // Get transaction receipt from VeChain
        const response = await thor.transactions.getTransactionReceipt(txId);
        return response as TransactionReceipt;
      } catch (error) {
        // If transaction is not found yet, return null (still pending)
        if (error instanceof Error && error.message.includes("not found")) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(thor && txId && enabled),
    refetchInterval: (query) => {
      // Stop polling once we have a receipt or if there's an error that's not "not found"
      if (query.state.data) return false;
      if (query.state.error && !query.state.error.message.includes("not found")) return false;
      return refetchInterval;
    },
    staleTime,
    retry: (failureCount, error) => {
      // Don't retry if it's a "not found" error (transaction still pending)
      if (error instanceof Error && error.message.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    receipt: receipt ?? null,
    isLoading,
    error: error as Error | null,
    isConfirmed: !!receipt,
    isReverted: receipt?.reverted ?? false,
  };
} 