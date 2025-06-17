// Router ABI for quote function - simplified version compatible with VeChain SDK
const ROUTER_ABI = [
  {
    inputs: [
      { name: "amountA", type: "uint256" },
      { name: "reserveA", type: "uint256" },
      { name: "reserveB", type: "uint256" }
    ],
    name: "quote",
    outputs: [{ name: "amountB", type: "uint256" }],
    stateMutability: "pure",
    type: "function"
  }
] as const;

export default ROUTER_ABI;