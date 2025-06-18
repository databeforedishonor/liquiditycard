import { useBuildTransaction } from "./chain/use-build-transaction";
import { token } from "@/types/token";
import { Balance } from "@/types/balance";
import { ROUTER_ADDRESS, TOKEN_CONSTANTS, createTokenFromConstant } from "@/lib/token-constants";
import { Interface } from "ethers";
import ROUTER_ABI from "@/lib/abi/router";
import { PAIR } from "@/lib/abi/pair";

const routerInterface = new Interface(ROUTER_ABI);
const lpTokenInterface = new Interface(PAIR);

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

interface RemoveLiquidityParams {
  pairAddress: string;
  token0: token;
  token1: token;
  token0Amount: Balance;
  token1Amount: Balance;
  lpAmount: Balance;
  slippage: number;
  account: string;
}

/**
 * Calculate minimum amount with slippage protection
 */
function calculateMinAmount(amount: Balance, slippage: number): string {
  const slippageFactor = BigInt(Math.floor((1 - slippage / 100) * 10 ** 18));
  const minAmount = (BigInt(amount.raw) * slippageFactor) / BigInt(10 ** 18);
  return minAmount.toString();
}

/**
 * Format token balance for display in comments
 */
function formatTokenBalance(amount: string, decimals: number, displayDecimals = 3): string {
  try {
    const amountBigInt = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const formatted = Number(amountBigInt) / Number(divisor);
    return formatted.toFixed(displayDecimals);
  } catch {
    return amount;
  }
}

/**
 * Build clauses for removing liquidity
 */
function buildRemoveLiquidityClauses(params: RemoveLiquidityParams): EnhancedClause[] {
  const { pairAddress, token0, token1, token0Amount, token1Amount, lpAmount, slippage, account } = params;
  
  // Convert VET tokens to BVET for transaction building
  const actualToken0 = convertVETToBVETForTransaction(token0);
  const actualToken1 = convertVETToBVETForTransaction(token1);
  
  const routerAddress = ROUTER_ADDRESS;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

  // Calculate minimum amounts with slippage protection
  const minToken0Amount = calculateMinAmount(token0Amount, slippage);
  const minToken1Amount = calculateMinAmount(token1Amount, slippage);

  const clauses: EnhancedClause[] = [];

  // Approve LP tokens for removal
  clauses.push({
    to: pairAddress,
    value: "0",
    data: lpTokenInterface.encodeFunctionData("approve", [
      routerAddress,
      lpAmount.raw.toString()
    ]),
    comment: `Approve LP tokens for removal`,
  });

  // Handle VET/Token pairs (now BVET/Token since VET is converted to BVET)
  if (token0.symbol === "VET" || token1.symbol === "VET") {
    // Determine which is the non-VET token and which is VET (now BVET)
    const isToken0VET = token0.symbol === "VET";
    const nonVETToken = isToken0VET ? actualToken1 : actualToken0;
    const vetToken = isToken0VET ? actualToken0 : actualToken1; // This is now BVET
    const nonVETAmount = isToken0VET ? token1Amount : token0Amount;
    const vetAmount = isToken0VET ? token0Amount : token1Amount;
    const minNonVETAmount = isToken0VET ? minToken1Amount : minToken0Amount;
    const minVETAmount = isToken0VET ? minToken0Amount : minToken1Amount;

    const formattedNonVETAmount = formatTokenBalance(nonVETAmount.raw, nonVETToken.decimals, 3);
    const formattedVETAmount = formatTokenBalance(vetAmount.raw, vetToken.decimals, 3);

    // Remove liquidity (BVET/Token pair) - using regular removeLiquidity since we're using BVET, not native VET
    clauses.push({
      to: routerAddress,
      value: "0",
      data: routerInterface.encodeFunctionData("removeLiquidity", [
        vetToken.tokenAddress.toString(),
        nonVETToken.tokenAddress.toString(),
        lpAmount.raw.toString(),
        minVETAmount,
        minNonVETAmount,
        account,
        deadline
      ]),
      comment: `Remove ${formattedVETAmount} ${token0.symbol} + ${formattedNonVETAmount} ${nonVETToken.symbol}`,
    });
  } else {
    // Handle Token/Token pairs
    const formattedToken0Amount = formatTokenBalance(token0Amount.raw, actualToken0.decimals, 3);
    const formattedToken1Amount = formatTokenBalance(token1Amount.raw, actualToken1.decimals, 3);

    clauses.push({
      to: routerAddress,
      value: "0",
      data: routerInterface.encodeFunctionData("removeLiquidity", [
        actualToken0.tokenAddress.toString(),
        actualToken1.tokenAddress.toString(),
        lpAmount.raw.toString(),
        minToken0Amount,
        minToken1Amount,
        account,
        deadline
      ]),
      comment: `Remove ${formattedToken0Amount} ${token0.symbol} + ${formattedToken1Amount} ${token1.symbol}`,
    });
  }

  return clauses;
}

/**
 * Hook for withdrawing liquidity with transaction modal management
 * 
 * @returns Transaction utilities for withdrawing liquidity
 */
export function useWithdrawLiquidityTransaction() {
  const {
    sendTransaction,
    TransactionModal,
    isLoading,
    error,
    isSuccess,
    transactionState,
    closeModal,
  } = useBuildTransaction<RemoveLiquidityParams>({
    clauseBuilder: buildRemoveLiquidityClauses,
    refetchQueryKeys: [
      ["token-balances"],
      ["lp-token-balance"],
      ["pair-reserves"],
      ["pair-total-supply"],
    ],
    invalidateCache: true,
    onSuccess: () => {
      console.log("Withdraw liquidity transaction confirmed!");
    },
    onError: (error) => {
      console.error("Withdraw liquidity transaction failed:", error);
    },
  });

  return {
    withdrawLiquidity: sendTransaction,
    TransactionModal,
    isLoading,
    error,
    isSuccess,
    transactionState,
    closeModal,
  };
} 