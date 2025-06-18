import { useQuery } from "@tanstack/react-query";
import { Pair } from "@/types/pair";
import { Balance } from "@/types/balance";
import { calculateRemovalAmounts } from "@/utils/liquidity/remove/functions";


interface UseRemoveLiquidityParams {
    selectedPair: Pair | null;
    lpTokenAmount: Balance | null;
    percentage: number;
    onSuccess?: (
        result: {
            amount0: Balance;
            amount1: Balance;
            lpAmount: Balance;
        } | null,
    ) => void;
}

export function useRemoveLiquidity({ selectedPair, lpTokenAmount, percentage, onSuccess }: UseRemoveLiquidityParams) {
    return useQuery({
        queryKey: ["removeLiquidity", selectedPair?.pairAddress, percentage],
        queryFn: async () => {
            if (!selectedPair || !lpTokenAmount || percentage === 0) return null;

            const lpAmountToRemove: Balance = {
                raw: ((BigInt(lpTokenAmount.raw) * BigInt(percentage)) / BigInt(100)).toString(),
                formatted: ((Number(lpTokenAmount.formatted) * percentage) / 100).toString(),
                decimals: lpTokenAmount.decimals,
            };

            const result = calculateRemovalAmounts({
                token0: selectedPair.token0,
                token1: selectedPair.token1,
                reserve0: selectedPair.reserve0.raw,
                reserve1: selectedPair.reserve1.raw,
                totalSupply: selectedPair.totalSupply.raw,
                lpAmount: lpAmountToRemove,
            });

            if (result) {
                const finalResult = {
                    ...result,
                    lpAmount: lpAmountToRemove,
                };
                onSuccess?.(finalResult);
                return finalResult;
            }

            return null;
        },
    });
}