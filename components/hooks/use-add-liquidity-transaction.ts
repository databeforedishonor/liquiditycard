import { useBuildTransaction } from "./chain/use-build-transaction";
import { token } from "@/types/token";
import { Balance } from "@/types/balance";
import { ROUTER_ADDRESS, TOKEN_CONSTANTS, createTokenFromConstant } from "@/lib/token-constants";
import { Interface } from "ethers";
import ROUTER_ABI from "@/lib/abi/router";
import { PAIR } from "@/lib/abi/pair";

const routerInterface = new Interface(ROUTER_ABI);
const erc20Interface = new Interface(PAIR);

/**
 * Helper function to convert VET tokens to BVET for transaction building
 * Since VET can't be used directly in smart contracts, DEX transactions use BVET instead
 */
function convertVETToBVETForTransaction(inputToken: token): token {
  if (inputToken.symbol !== "VET") {
    return inputToken
  }
  
  // Return BVET token instead of VET for transactions
  return createTokenFromConstant(TOKEN_CONSTANTS.BVET, inputToken.value.toString())
}

interface EnhancedClause {
  to: string;
  value: string;
  data: string;
  comment?: string;
}

interface AddLiquidityParams {
  tokenA: token;
  tokenB: token;
  amountA: Balance;
  amountB: Balance;
  slippage: number;
  account: string;
}

/**
 * Hook for adding liquidity with transaction modal management
 * 
 * @returns Transaction utilities for adding liquidity
 */
export function useAddLiquidityTransaction() {
  const buildAddLiquidityClauses = (params: AddLiquidityParams): EnhancedClause[] => {
    const { tokenA, tokenB, amountA, amountB, slippage, account } = params;
    
    // Convert VET tokens to BVET for transaction building
    const actualTokenA = convertVETToBVETForTransaction(tokenA);
    const actualTokenB = convertVETToBVETForTransaction(tokenB);
    
    const routerAddress = ROUTER_ADDRESS;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    
    // Calculate minimum amounts with slippage protection
    const slippageFactor = BigInt(Math.floor((1 - slippage / 100) * 10 ** 18));
    const amountAMin = (BigInt(amountA.raw) * slippageFactor) / BigInt(10 ** 18);
    const amountBMin = (BigInt(amountB.raw) * slippageFactor) / BigInt(10 ** 18);

    const clauses: EnhancedClause[] = [];

    // Handle VET/Token pairs (now BVET/Token since VET is converted to BVET)
    if (tokenA.symbol === "VET" || tokenB.symbol === "VET") {
      // Determine which is the non-VET token and which is VET (now BVET)
      const isTokenAVET = tokenA.symbol === "VET";
      const nonVETToken = isTokenAVET ? actualTokenB : actualTokenA;
      const vetToken = isTokenAVET ? actualTokenA : actualTokenB; // This is now BVET
      const nonVETAmount = isTokenAVET ? amountB : amountA;
      const vetAmount = isTokenAVET ? amountA : amountB;
      const nonVETAmountMin = isTokenAVET ? amountBMin : amountAMin;
      const vetAmountMin = isTokenAVET ? amountAMin : amountBMin;

      // Approve non-VET token for router
      clauses.push({
        to: nonVETToken.tokenAddress.toString(),
        value: "0",
        data: erc20Interface.encodeFunctionData("approve", [
          routerAddress,
          nonVETAmount.raw.toString()
        ]),
        comment: `Approve ${nonVETToken.symbol} for liquidity addition`,
      });

      // Approve BVET token for router (since VET is converted to BVET)
      clauses.push({
        to: vetToken.tokenAddress.toString(),
        value: "0",
        data: erc20Interface.encodeFunctionData("approve", [
          routerAddress,
          vetAmount.raw.toString()
        ]),
        comment: `Approve ${vetToken.symbol} for liquidity addition`,
      });

      // Add liquidity (BVET/Token pair)
      clauses.push({
        to: routerAddress,
        value: "0", // No native VET sent since we're using BVET
        data: routerInterface.encodeFunctionData("addLiquidity", [
          vetToken.tokenAddress.toString(),
          nonVETToken.tokenAddress.toString(),
          vetAmount.raw.toString(),
          nonVETAmount.raw.toString(),
          vetAmountMin.toString(),
          nonVETAmountMin.toString(),
          account,
          deadline
        ]),
        comment: `Add ${vetAmount.formatted} ${tokenA.symbol} + ${nonVETAmount.formatted} ${nonVETToken.symbol}`,
      });
    } else {
      // Handle Token/Token pairs
      
      // Approve tokenA for router
      clauses.push({
        to: actualTokenA.tokenAddress.toString(),
        value: "0",
        data: erc20Interface.encodeFunctionData("approve", [
          routerAddress,
          amountA.raw.toString()
        ]),
        comment: `Approve ${actualTokenA.symbol} for liquidity addition`,
      });

      // Approve tokenB for router
      clauses.push({
        to: actualTokenB.tokenAddress.toString(),
        value: "0",
        data: erc20Interface.encodeFunctionData("approve", [
          routerAddress,
          amountB.raw.toString()
        ]),
        comment: `Approve ${actualTokenB.symbol} for liquidity addition`,
      });

      // Add liquidity
      clauses.push({
        to: routerAddress,
        value: "0",
        data: routerInterface.encodeFunctionData("addLiquidity", [
          actualTokenA.tokenAddress.toString(),
          actualTokenB.tokenAddress.toString(),
          amountA.raw.toString(),
          amountB.raw.toString(),
          amountAMin.toString(),
          amountBMin.toString(),
          account,
          deadline
        ]),
        comment: `Add ${amountA.formatted} ${tokenA.symbol} + ${amountB.formatted} ${tokenB.symbol}`,
      });
    }

    return clauses;
  };

  const {
    sendTransaction,
    TransactionModal,
    isLoading,
    error,
    isSuccess,
    transactionState,
    closeModal,
  } = useBuildTransaction<AddLiquidityParams>({
    clauseBuilder: buildAddLiquidityClauses,
    refetchQueryKeys: [
      ["token-balances"],
      ["lp-token-balance"],
      ["pair-reserves"],
      ["pair-total-supply"],
    ],
    invalidateCache: true,
    onSuccess: () => {
      console.log("Add liquidity transaction confirmed!");
    },
    onError: (error) => {
      console.error("Add liquidity transaction failed:", error);
    },
  });

  return {
    addLiquidity: sendTransaction,
    TransactionModal,
    isLoading,
    error,
    isSuccess,
    transactionState,
    closeModal,
  };
} 