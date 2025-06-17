import type {
  ContractClause as VeChainContractClause,
  TransactionSimulationResult,
} from "@vechain/sdk-network";
import type { Interface } from "ethers";

export interface BuildClauseParams<T = Interface> {
  contractAddress?: string | null;
  contractInterface: T;
  method: string;
  args?: any[];
  value?: string;
  comment?: string;
  caller?: string;
}

export interface DeployContractParams {
  bytecode: string;
  constructorArgs?: any[];
  value?: string;
  comment?: string;
  caller?: string;
}

export interface ExtendedClause {
  to: string | null;
  value: string;
  data: string;
  comment?: string;
  caller?: string;
}

export interface ExtendedContractClause extends VeChainContractClause {
  read: () => Promise<any>;
  call: () => Promise<any>;
}

export type ContractClause = VeChainContractClause;
export type ContractClauses = VeChainContractClause[];

export interface SimulationResult {
  success: boolean;
  data?: any;
  error?: string;
  outputs?: TransactionSimulationResult[];
}

export interface UseTransactionSimulationProps {
  clauses?: VeChainContractClause[];
  caller?: string;
  enabled?: boolean;
}

export interface UseTransactionSimulationResult {
  data?: SimulationResult;
  isLoading: boolean;
  error?: Error;
  refetch: () => void;
}
