import { Address } from "@vechain/sdk-core";

export class token {
  readonly name: string;
  readonly tokenAddress: Address;
  readonly symbol: string;
  readonly decimals: number;
  readonly image?: string;
  readonly description?: string;
  readonly value: bigint;

  constructor(params: {
    tokenAddress: Address;
    name: string;
    symbol: string;
    decimals: number;
    value?: bigint;
    image?: string;
    description?: string;
  }) {
    this.tokenAddress = params.tokenAddress;
    this.name = params.name;
    this.symbol = params.symbol;
    this.decimals = params.decimals;
    this.value = params.value || BigInt(0);
    this.image = params.image;
    this.description = params.description;
  }

  // Format method to handle decimal formatting
  format(decimals?: number): string {
    const divisor = BigInt(10) ** BigInt(this.decimals);
    const wholePart = this.value / divisor;
    const fractionalPart = this.value % divisor;

    if (decimals === undefined || decimals === 0) {
      return wholePart.toString();
    }

    const fractionalStr = fractionalPart
      .toString()
      .padStart(this.decimals, "0");
    const truncatedFractional = fractionalStr.slice(0, decimals);

    return `${wholePart}.${truncatedFractional}`;
  }

  // Static method to create a token with a specific value
  static of(
    value: bigint,
    params: {
      tokenAddress: Address;
      name: string;
      symbol: string;
      decimals: number;
      image?: string;
      description?: string;
    },
  ): token {
    return new token({
      ...params,
      value,
    });
  }
}
