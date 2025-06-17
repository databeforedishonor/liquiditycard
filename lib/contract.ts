import type { ContractClause } from "@vechain/sdk-network";
import type { ContractClauses, ExtendedClause } from "../types/contract";

/**
 * Converts a single ContractClause to an enhanced clause format
 */
export function toExtendedClause(clause: ContractClause): ExtendedClause {
  // Handle both nested clause structure and plain clause objects
  const actualClause = clause.clause || clause;

  if (!actualClause) {
    console.log("Invalid contract clause provided");
    throw new Error("Invalid contract clause provided");
  }

  return {
    to: actualClause.to === undefined ? null : actualClause.to,
    value: actualClause.value?.toString() || "0",
    data: actualClause.data || "0x",
    comment: actualClause.comment,
  };
}

/**
 * Converts an array of ContractClauses to enhanced clauses
 */
export function toExtendedClauses(clauses: ContractClauses): ExtendedClause[] {
  if (!Array.isArray(clauses)) {
    throw new Error("Invalid contract clauses array provided");
  }

  return clauses.map(toExtendedClause);
}
