import { Address } from "@vechain/sdk-core";
import { token } from "@/types/token";

export const TOKEN_CONSTANTS = {
  VET: {
    name: "VeChain",
    symbol: "VET",
    decimals: 18,
    address: "", 
    desc: "Native VeChain token",
    icon: "data:image/x-icon;base64,AAABAAEAMDAAAAEACABVAwAAFgAAAIlQTkcNChoKAAAADUlIRFIAAAAwAAAAMAgGAAAAVwL5hwAAAxxJREFUaIHtWTGM0lAY/lpUUupFZWBhIseII3EjBgamuzjidiY6a+Lm7GpibnaX0RzTDZDIpDDCCDLB0Bi46JUGDqgD1/L6pOW17zVcE76pj7bwf9/3v/f/7yGdPe8DACDDRCQgAStTskby+jMpIsEDgOkQW4YME1GK38ItCRkrSLuevbOQYcrRyf3tkPcdAC8OBPaNA4F94x7LQ4oqIZ154Hrf0FcYDm64g0ln7kNR15oOB3MY+u4FkokAIOHVhyQU1b1kjLUl2o0pmhfXTD9M48XrRyicqLfftcDHNxrTe0wpZOgrNC+uPZ9JpmIoV47w/nPKk6jbu1bwANCqT5nfZZ4DzZrOpGwyFUPl7WPmAACg/PLIvh5rC7QbBvO7zAS2udD5YaBVn6JVn2KsLezPnz5TcJxznzMkkqkY8sWEPe515phoS9aw/K1CtAujwQLV8ytUz6/w6d1vxz1SVS/kSwnH+LL6109I/ggY+gptIj8Lp6qd77RD2VwcyVTM8/to9Vv1qS/1gQB14HttE6SiyiicPLTHtEPlircLxxRJv+oDAQhMtCVaDTYX8qWE54pEplkQ9YGAlZhMI0WVHWlAu0A6RCJfTHCrDwQk0O/O0evO7HHhdBMk7QLpEAkR6gMcvdDl141i9GQkXaDnCfC/+s2ad5H0QmACtAv5kmJf73KBVL/XmWE02NQQv+DqRkkXsrm4o3g1a7p9TbogKvctcBGgXSCVNfSVY7WyKjU5X4a/5uh35zwh8O8HvFyw7ln9TTYXRzqzaYBJl4KCm0C/O3fsBUgXJtoSve7Mng88TZsbhOzI6BaCdOHblz/o/Jy5usMLIQTaDcO1kRsNbjDRlo5VSpT6gMA9Me0Cmet0nRClPiCSgEcLEUbuWxBGwK2RC1N9QPCxyjYXaPV7nOs+DaEEtrUQvBuWXRB+sEU3ciRE5r4F4QTcjmDCUB8I6WhxW4vA27S5QTor9kP5g+MJtaEPQ32A+WjRP8IKmEbkT6cPBPaNA4F9I9oEzKj/U29aDpgR5LAuv9K6kJmmBBOABPPO+7HOmHW0AP4BB5aSOY6N9JcAAAAASUVORK5CYII=",
    website: "https://www.vechain.org"
  },
  VTHO: {
    name: "VeThor Token",
    symbol: "VTHO",
    decimals: 18,
    address: "0x0000000000000000000000000000456E65726779", // VTHO address (placeholder)
    desc: "VeThor energy token used for gas fees",
    icon: "https://vechain.github.io/token-registry/assets/758582f7256e1e00149bdd5e4607534f092303cc.png",
    website: "https://www.vechain.org"
  },
  USDGLO: {
    name: "Glo Dollar",
    symbol: "USDGLO",
    decimals: 18,
    address: "0x29c630cce4ddb23900f5fe66ab55e488c15b9f5e",
    desc: "Glo Dollar is the stablecoin that funds public goods and charities. Unlike other stablecoins, we donate all our profits. This unlocks up to $7b in funding to make crypto and the world a better place.",
    icon: "https://vechain.github.io/token-registry/assets/6d55bdde89f83265f94ec07b491573334625cdc6.png",
    totalSupply: "311182000000000000000000",
    website: "https://www.glodollar.org"
  },
  B3TR: {
    name: "B3TR",
    symbol: "B3TR",
    decimals: 18,
    address: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
    desc: "The official utility token in the VeBetterDAO",
    icon: "https://vechain.github.io/token-registry/assets/38b6a2fdff4c109128935762dc27853c773fef21.png",
    totalSupply: "229730160000000000000000000"
  },
  BVET: {
    name: "Better VET",
    symbol: "BVET",
    decimals: 18,
    address: "0xf9b02b47694fd635a413f16dc7b38af06cc16fe5",
    desc: "Wrapper VET VIP-180 token (VIP-180) that 1:1 pegs VET",
    icon: "https://vechain.github.io/token-registry/assets/1b51232270c6f7b34b4ce9dd1001df0197e56e24.png",
    totalSupply: "19804436148403498697674441",
    website: "https://www.swap.tbc.vet/"
  }
} as const;

export function createTokenFromConstant(tokenConstant: typeof TOKEN_CONSTANTS[keyof typeof TOKEN_CONSTANTS], balance: string = "0"): token {
  return new token({
    tokenAddress: Address.of(tokenConstant.address),
    name: tokenConstant.name,
    symbol: tokenConstant.symbol,
    decimals: tokenConstant.decimals,
    value: BigInt(balance),
    image: tokenConstant.icon,
    description: tokenConstant.desc,
  });
}

export const AVAILABLE_TOKENS = Object.values(TOKEN_CONSTANTS).map(tokenConstant => 
  createTokenFromConstant(tokenConstant)
); 


export const ROUTER_ADDRESS = "0x349Ede93B675c0F0f8d7CdaD74eCF1419943E6ac";
export const FACTORY_ADDRESS = "0x5970DcBeBAc33e75eFf315C675f1d2654f7bF1f5";