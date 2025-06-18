import { useSendTransaction } from "./use-send-transaction";

interface EnhancedClause {
  to: string;
  value: string;
  data: string;
  comment?: string;
}

interface UseBuildTransactionOptions<TParams> {
  clauseBuilder: (params: TParams) => EnhancedClause[];
  refetchQueryKeys?: string[][];
  invalidateCache?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  signerAccount?: string;
}

/**
 * Hook for building and sending transactions with proper query management
 * 
 * @param options - Configuration options for building transactions
 * @returns Object with sendTransaction function and transaction utilities
 */
export function useBuildTransaction<TParams>(
  options: UseBuildTransactionOptions<TParams>
) {
  const {
    clauseBuilder,
    refetchQueryKeys = [],
    invalidateCache = true,
    onSuccess,
    onError,
    signerAccount,
  } = options;

  const {
    sendTransaction: sendRawTransaction,
    TransactionModal,
    isLoading,
    error,
    isSuccess,
    transactionState,
    closeModal,
    mutateAsync,
  } = useSendTransaction({
    signerAccount,
    refetchQueryKeys,
    invalidateCache,
    onTxConfirmed: onSuccess,
    onTxFailedOrCancelled: () => {
      if (error) {
        onError?.(error as Error);
      }
    },
  });

  const sendTransaction = async (params: TParams) => {
    try {
      const clauses = clauseBuilder(params);
      return await sendRawTransaction(clauses);
    } catch (error) {
      console.error('Transaction failed:', error);
      onError?.(error as Error);
      throw error;
    }
  };

  return {
    sendTransaction,
    TransactionModal,
    isLoading,
    error,
    isSuccess,
    transactionState,
    closeModal,
    mutateAsync: (params: TParams) => {
      const clauses = clauseBuilder(params);
      return mutateAsync({ clauses });
    },
  };
} 