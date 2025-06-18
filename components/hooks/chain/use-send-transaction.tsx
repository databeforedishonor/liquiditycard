import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@vechain/dapp-kit-react";
import { useState, useEffect } from "react";
import { useTxReceipt } from "./use-tx-receipt";

interface TransactionStatusErrorType {
  type: "SendTransactionError" | "TxReceiptError" | "RevertReasonError";
  reason?: string;
}

interface TransactionState {
  status: "idle" | "pending" | "waitingConfirmation" | "confirmed" | "error";
  txId?: string;
  error?: TransactionStatusErrorType;
}

interface SendTransactionParams {
  clauses: Array<{
    to: string;
    value: string;
    data: string;
    comment?: string;
  }>;
}

interface UseSendTransactionOptions {
  signerAccount?: string;
  onTxConfirmed?: () => void;
  onTxFailedOrCancelled?: () => void;
  refetchQueryKeys?: string[][];
  invalidateCache?: boolean;
}

interface SendTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionState: TransactionState;
  txId?: string;
}

// Simple modal component for transaction status
function SendTransactionModal({ 
  isOpen, 
  onClose, 
  transactionState, 
  txId 
}: SendTransactionModalProps) {
  if (!isOpen) return null;

  const getStatusMessage = () => {
    switch (transactionState.status) {
      case "pending":
        return "Please confirm the transaction in your wallet...";
      case "waitingConfirmation":
        return "Transaction sent! Waiting for confirmation...";
      case "confirmed":
        return "Transaction confirmed successfully!";
      case "error":
        return `Transaction failed: ${transactionState.error?.reason || "Unknown error"}`;
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (transactionState.status) {
      case "pending":
        return "text-blue-600";
      case "waitingConfirmation":
        return "text-yellow-600";
      case "confirmed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Transaction Status</h3>
          {(transactionState.status === "confirmed" || transactionState.status === "error") && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="text-center">
          <div className={`text-sm ${getStatusColor()} mb-4`}>
            {getStatusMessage()}
          </div>
          
          {transactionState.status === "pending" && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          )}
          
          {transactionState.status === "waitingConfirmation" && (
            <div className="animate-pulse">
              <div className="h-2 bg-yellow-200 rounded-full">
                <div className="h-2 bg-yellow-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          
          {txId && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs break-all">
              <span className="font-medium">Transaction ID:</span>
              <br />
              {txId}
            </div>
          )}
          
          {transactionState.status === "confirmed" && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Close
            </button>
          )}
          
          {transactionState.status === "error" && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for sending transactions with modal management
 * 
 * @param options - Configuration options for the transaction
 * @returns Mutation object with sendTransaction function and modal component
 */
export function useSendTransaction(options: UseSendTransactionOptions = {}) {
  const {
    signerAccount,
    onTxConfirmed,
    onTxFailedOrCancelled,
    refetchQueryKeys = [],
    invalidateCache = true,
  } = options;

  const { account, requestTransaction } = useWallet();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionState, setTransactionState] = useState<TransactionState>({
    status: "idle",
  });

  // Poll for transaction receipt
  const { receipt, isConfirmed, isReverted } = useTxReceipt(
    transactionState.txId,
    {
      enabled: transactionState.status === "waitingConfirmation",
    }
  );

  // Handle receipt confirmation
  useEffect(() => {
    if (transactionState.status === "waitingConfirmation" && isConfirmed) {
      if (isReverted) {
        setTransactionState({
          status: "error",
          txId: transactionState.txId,
          error: {
            type: "RevertReasonError",
            reason: "Transaction was reverted",
          },
        });
        onTxFailedOrCancelled?.();
      } else {
        setTransactionState({
          status: "confirmed",
          txId: transactionState.txId,
        });

        // Handle cache invalidation
        if (invalidateCache && refetchQueryKeys.length > 0) {
          Promise.all(
            refetchQueryKeys.map(async (queryKey) => {
              await queryClient.cancelQueries({ queryKey });
              await queryClient.invalidateQueries({ queryKey });
            })
          );
        }

        onTxConfirmed?.();
      }
    }
  }, [
    transactionState.status,
    transactionState.txId,
    isConfirmed,
    isReverted,
    invalidateCache,
    refetchQueryKeys,
    queryClient,
    onTxConfirmed,
    onTxFailedOrCancelled,
  ]);

  const mutation = useMutation({
    mutationFn: async ({ clauses }: SendTransactionParams) => {
      console.log('Debug transaction state:', { 
        hasRequestTransaction: !!requestTransaction, 
        account, 
        clausesCount: clauses.length 
      });
      
      if (!requestTransaction || !account) {
        throw new Error("Wallet not connected");
      }

      // Convert clauses to the format expected by VeChain DApp Kit
      const transactionClauses = clauses.map(clause => ({
        to: clause.to,
        value: clause.value,
        data: clause.data,
      }));

      // Use the new requestTransaction method from useWallet
      const result = await requestTransaction(transactionClauses);

      return {
        txid: result.txid,
        signer: result.signer,
      };
    },
    onMutate: () => {
      setIsModalOpen(true);
      setTransactionState({ status: "pending" });
    },
    onSuccess: (data) => {
      setTransactionState({
        status: "waitingConfirmation",
        txId: data.txid,
      });
      // Receipt polling will handle the confirmation
    },
    onError: (error: Error) => {
      setTransactionState({
        status: "error",
        error: {
          type: "SendTransactionError",
          reason: error.message,
        },
      });
      onTxFailedOrCancelled?.();
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionState({ status: "idle" });
  };

  const sendTransaction = async (clauses: SendTransactionParams["clauses"]) => {
    return mutation.mutateAsync({ clauses });
  };

  // Modal component
  const TransactionModal = () => (
    <SendTransactionModal
      isOpen={isModalOpen}
      onClose={closeModal}
      transactionState={transactionState}
      txId={transactionState.txId}
    />
  );

  return {
    sendTransaction,
    TransactionModal,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    transactionState,
    closeModal,
    mutateAsync: mutation.mutateAsync,
  };
} 