import type { ContractClause } from "@vechain/sdk-network";
import { TransactionReceipt } from "@vechain/sdk-network";
import { TransactionStatus } from "./transaction";

export interface ClauseResponse<T = ContractClause[] | undefined> {
  clauses: T;
  isLoading: boolean;
  error: Error | null;
}

export interface ReadClauseResponse {
  clauses: ContractClause[] | undefined;
  isLoading: boolean;
  error: Error | null;
  isError?: boolean;
  call: any;
  callLoading: boolean;
  callError: Error | null;
  refresh?: () => Promise<any>;
  forceRefresh?: () => Promise<any>;
}

export interface WriteClauseResponse
  extends ClauseResponse<ContractClause[] | undefined> {
  // Transaction sending capabilities
  sendTransaction?: (options?: {
    invalidateCache?: boolean;
    refetchQueryKeys?: string[][];
    onSuccess?: () => void;
    onError?: (error: any) => void;
    signerAccountAddress?: string;
  }) => Promise<void>;
  txReceipt?: TransactionReceipt | null;
  txStatus?: TransactionStatus;
  txError?: any;
  resetTxStatus?: () => void;
}
