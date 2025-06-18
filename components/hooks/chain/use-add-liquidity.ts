import { useQuery } from "@tanstack/react-query";
import { calculateAddLiquidityAmount } from "@/utils/liquidity/add/functions";
import { createBalanceObjectFromRaw } from "@/utils/balance/balanceFunctions";
import { useMemo } from "react";
import { usePairReserves } from "./use-pair-reserves";
import { usePairTotalSupply } from "./use-pair-total-supply";
import { Balance } from "@/types/balance";
import { Pair } from "@/types/pair";
import { token } from "@/types";

interface UseAddLiquidityParams {
    pair: Pair | null;
    token0: token | null;
    token0Amount: Balance | null;
    token1: token | null;
    token1Amount: Balance | null;
    lastChangedField: "token0" | "token1" | null;
    onSuccess?: (
        result: {
            token0: Balance;
            token1: Balance;
            lpAmount: Balance | null;
        } | null,
    ) => void;
}

export function useAddLiquidity({ pair, token0, token0Amount, token1, token1Amount, lastChangedField, onSuccess }: UseAddLiquidityParams) {
    const { call: liveReserves, isLoading: isReservesLoading } = usePairReserves(pair?.pairAddress!);
    const { totalSupply: liveTotalSupply, isLoading: isTotalSupplyLoading } = usePairTotalSupply(pair?.pairAddress!);

    const pairWithLiveReserves = useMemo(() => {
        if (!pair || !liveReserves || !liveTotalSupply) return pair;

        return {
            ...pair,
            reserve0: createBalanceObjectFromRaw(liveReserves.reserve0, pair.token0.decimals),
            reserve1: createBalanceObjectFromRaw(liveReserves.reserve1, pair.token1.decimals),
            totalSupply: createBalanceObjectFromRaw(liveTotalSupply, 18),
        };
    }, [pair, liveReserves, liveTotalSupply]);

    return useQuery({
        queryKey: ["addLiquidity", pair?.pairAddress, lastChangedField, lastChangedField === "token0" ? token0Amount?.raw : token1Amount?.raw, liveReserves?.reserve0, liveReserves?.reserve1],
        queryFn: async () => {
            if (!pairWithLiveReserves || (!token0Amount && !token1Amount) || !lastChangedField || !token0 || !token1) {
                return null;
            }

            const result = calculateAddLiquidityAmount(pairWithLiveReserves, token0Amount, token1Amount, lastChangedField, token0, token1);
            if (result) {
                const { token0, token1, lpAmount } = result;
                const formattedResult = {
                    token0,
                    token1,
                    lpAmount: lpAmount ?? null,
                };

                onSuccess?.(formattedResult);
                return formattedResult;
            }

            return null;
        },
        enabled: !!pairWithLiveReserves && (!!token0Amount || !!token1Amount) && !!lastChangedField && !!token0 && !!token1 && !isReservesLoading && !isTotalSupplyLoading,
    });
}