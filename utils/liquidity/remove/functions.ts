import { token } from "@/types";
import { Balance } from "@/types/balance";
import { formatUnits } from "ethers";

interface CalculateRemovalAmountsParams {
    token0: token;
    token1: token;
    reserve0: string;
    reserve1: string;
    totalSupply: string;
    lpAmount: Balance;
}

export function calculateRemovalAmounts({
    token0,
    token1,
    reserve0,
    reserve1,
    totalSupply,
    lpAmount
}: CalculateRemovalAmountsParams): { amount0: Balance; amount1: Balance } {
    if (!lpAmount.raw || !totalSupply || !reserve0 || !reserve1) {
        return {
            amount0: { raw: "0", formatted: "0", decimals: token0.decimals },
            amount1: { raw: "0", formatted: "0", decimals: token1.decimals }
        };
    }

    const amount0Raw = (BigInt(lpAmount.raw) * BigInt(reserve0)) / BigInt(totalSupply);
    const amount1Raw = (BigInt(lpAmount.raw) * BigInt(reserve1)) / BigInt(totalSupply);

    return {
        amount0: {
            raw: amount0Raw.toString(),
            formatted: formatUnits(amount0Raw, token0.decimals),
            decimals: token0.decimals
        },
        amount1: {
            raw: amount1Raw.toString(),
            formatted: formatUnits(amount1Raw, token1.decimals),
            decimals: token1.decimals
        }
    };
} 