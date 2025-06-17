import { Interface } from "ethers";
import { ABIFunction } from "@vechain/sdk-core";
import {
  BuildClauseParams,
  ContractClause,
  DeployContractParams,
} from "../types/contract";

// Create a minimal ABIFunction for deployment
const deploymentABI = new ABIFunction("constructor()");

/**
 * Build a single contract clause
 */
export function buildClause<T extends Interface>({
  contractAddress,
  contractInterface,
  method,
  args = [],
  value = "0",
  comment,
  caller,
}: BuildClauseParams<T>): ContractClause {
  // Handle contract deployment case (when contractAddress is null/undefined)
  if (!contractAddress) {
    // For deployment with special __deployment__ method, use raw bytecode
    if (method === "__deployment__") {
      // Extract bytecode from first argument
      const bytecode = args[0] as string;
      const constructorArgs = args.slice(1);

      if (!bytecode) {
        throw new Error("Bytecode is required for contract deployment");
      }

      // For now, use bytecode as-is (constructor args encoding would need more complex logic)
      const clause = {
        to: null, // null indicates contract creation
        value: value?.toString() || "0",
        data: bytecode,
        comment: comment || "Deploy contract",
        caller,
      };

      return {
        clause: clause as any,
        functionAbi: deploymentABI,
      };
    }

    // For other deployment cases, try to encode function data
    const data = contractInterface.encodeFunctionData(method as string, args);

    const clause = {
      to: null, // null indicates contract creation
      value: value?.toString() || "0",
      data: data,
      comment: comment || "Deploy contract",
      caller,
    };

    return {
      clause: clause as any,
      functionAbi: deploymentABI,
    };
  }

  // Handle regular contract function calls
  const functionFragment = contractInterface.getFunction(method as string);

  if (!functionFragment) {
    throw new Error(
      `Function ${String(method)} not found in the contract interface`,
    );
  }

  const abiSignature = functionFragment.format("full");
  const functionAbi = new ABIFunction(abiSignature);
  const data = contractInterface.encodeFunctionData(method as string, args);

  const clause = {
    to: contractAddress.toString(),
    value: value?.toString() || "0",
    data: data,
    comment,
    caller,
  };

  return {
    clause: clause as any,
    functionAbi,
  };
}

/**
 * Build a contract deployment clause with raw bytecode
 */
export function buildDeploymentClause({
  bytecode,
  constructorArgs = [],
  value = "0",
  comment,
  caller,
}: DeployContractParams): ContractClause {
  // For deployment with raw bytecode, we need to encode constructor args if provided
  const data = bytecode;

  // If constructor args are provided, we need to encode them and append to bytecode
  // This is a simplified approach - in practice you'd need the constructor ABI
  if (constructorArgs.length > 0) {
    // For now, assume bytecode already includes encoded constructor args
    // In a full implementation, you'd need to encode constructor args properly
    console.warn(
      "Constructor args provided but encoding not implemented. Ensure bytecode includes encoded constructor args.",
    );
  }

  const clause = {
    to: null, // null indicates contract creation
    value: value?.toString() || "0",
    data: data,
    comment: comment || "Deploy contract",
    caller,
  };

  return {
    clause: clause as any,
    functionAbi: deploymentABI,
  };
}

/**
 * Build multiple clauses in batch
 */
export function buildClauseBatch<T extends Interface>(
  params: BuildClauseParams<T>[],
): ContractClause[] {
  return params.map((param) => buildClause(param));
}
