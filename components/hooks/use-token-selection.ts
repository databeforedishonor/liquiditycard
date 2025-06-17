import { useState, useEffect, useMemo } from "react"
import { useWallet } from "@vechain/dapp-kit-react"
import { token } from "../../types/token"
import { useAllTokenBalances } from "./chain/use-token-balances"
import { useVetBalance } from "./chain/use-vet-balance"
import { useGetPairAddress } from "./chain/use-get-pair-address"
import { useQuote } from "./chain/use-quote"
import { usePairReserves } from "./chain/use-pair-reserves"
import { usePairTotalSupply } from "./chain/use-pair-total-supply"
import { AVAILABLE_TOKENS, TOKEN_CONSTANTS, createTokenFromConstant } from "@/lib/token-constants"
import { useGetPairTokens } from "./chain/use-get-pair-tokens"

interface UseTokenSelectionReturn {
  firstToken: token | null
  secondToken: token | null
  tokens: token[]
  showTokenList: number | null
  isTokensLoading: boolean
  pairAddress: string | null
  isPairLoading: boolean
  pairError: Error | null
  pairTokens: { token0: string; token1: string } | null
  isPairTokensLoading: boolean
  pairTokensError: Error | null
  firstTokenAmount: string
  secondTokenAmount: string
  quote: string
  isQuoteLoading: boolean
  quoteError: Error | null
  reserves: { reserve0: string; reserve1: string } | null
  isReservesLoading: boolean
  reservesError: Error | null
  totalSupply: string | null
  isTotalSupplyLoading: boolean
  totalSupplyError: Error | null
  setFirstToken: (token: token) => void
  setSecondToken: (token: token) => void
  setShowTokenList: (value: number | null) => void
  handleTokenSelect: (selectedToken: token) => void
  setFirstTokenAmount: (amount: string) => void
  setSecondTokenAmount: (amount: string) => void
  swapTokens: () => void
}

export function useTokenSelection(): UseTokenSelectionReturn {
  const { account } = useWallet()
  
  const [firstToken, setFirstToken] = useState<token | null>(null)
  const [secondToken, setSecondToken] = useState<token | null>(null)
  const [showTokenList, setShowTokenList] = useState<number | null>(null)
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>("")
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>("")

  // Get VET balance using special hook
  const { data: vetAccountData, isLoading: isVetBalanceLoading } = useVetBalance(account || "")
  const vetBalance = vetAccountData?.balance?.toString() || "0"

  // Get all ERC20 token balances at once
  const { balances: allTokenBalances, isLoading: isAllBalancesLoading } = useAllTokenBalances({
    userAddress: account || "",
  })

  // Create tokens with updated balances
  const tokens = useMemo(() => {
    return AVAILABLE_TOKENS.map((availableToken) => {
      let balance = "0"
      
      // Handle VET balance specially
      if (availableToken.symbol === "VET") {
        balance = vetBalance
      } else {
        // Get balance from the batch result
        balance = allTokenBalances[availableToken.tokenAddress.toString()] || "0"
      }
      
      // Create new token instance with balance
      return new token({
        tokenAddress: availableToken.tokenAddress,
        name: availableToken.name,
        symbol: availableToken.symbol,
        decimals: availableToken.decimals,
        value: BigInt(balance),
        image: availableToken.image,
        description: availableToken.description,
      })
    })
  }, [allTokenBalances, vetBalance])

  // Update the selected tokens with their balances when balances are fetched
  const updatedFirstToken = useMemo(() => {
    if (!firstToken) return null
    
    let balance = "0"
    if (firstToken.symbol === "VET") {
      balance = vetBalance
    } else {
      balance = allTokenBalances[firstToken.tokenAddress.toString()] || "0"
    }
    
    return new token({
      tokenAddress: firstToken.tokenAddress,
      name: firstToken.name,
      symbol: firstToken.symbol,
      decimals: firstToken.decimals,
      value: BigInt(balance),
      image: firstToken.image,
      description: firstToken.description,
    })
  }, [firstToken, allTokenBalances, vetBalance])

  const updatedSecondToken = useMemo(() => {
    if (!secondToken) return null
    
    let balance = "0"
    if (secondToken.symbol === "VET") {
      balance = vetBalance
    } else {
      balance = allTokenBalances[secondToken.tokenAddress.toString()] || "0"
    }
    
    return new token({
      tokenAddress: secondToken.tokenAddress,
      name: secondToken.name,
      symbol: secondToken.symbol,
      decimals: secondToken.decimals,
      value: BigInt(balance),
      image: secondToken.image,
      description: secondToken.description,
    })
  }, [secondToken, allTokenBalances, vetBalance])

  // Get pair address when both tokens are not null
  const {
    pairAddress,
    isLoading: isPairLoading,
    error: pairError,
  } = useGetPairAddress(
    updatedFirstToken?.tokenAddress.toString() || "",
    updatedSecondToken?.tokenAddress.toString() || "",
    Boolean(updatedFirstToken && updatedSecondToken)
  )


  // Get pair tokens when we have a pair address
  const {
    tokens: pairTokens,
    isLoading: isPairTokensLoading,
    error: pairTokensError,
  } = useGetPairTokens(
    pairAddress || "",
    Boolean(pairAddress)
  )

  // Get pair reserves when we have a pair address
  const {
    call: reserves,
    isLoading: isReservesLoading,
    error: reservesError,
  } = usePairReserves(
    pairAddress || "",
    Boolean(pairAddress)
  )

  // Get pair total supply when we have a pair address
  const {
    totalSupply,
    isLoading: isTotalSupplyLoading,
    error: totalSupplyError,
  } = usePairTotalSupply(
    pairAddress || "",
    Boolean(pairAddress)
  )

  // Determine quote parameters based on which input has a value
  const hasFirstAmount = Boolean(firstTokenAmount && firstTokenAmount !== "" && firstTokenAmount !== "0")
  const hasSecondAmount = Boolean(secondTokenAmount && secondTokenAmount !== "" && secondTokenAmount !== "0")
  
  // We need two separate quote calls - one for each direction
  const hasValidQuoteParams = Boolean(pairAddress && updatedFirstToken && updatedSecondToken)

  // Quote for first token input -> second token output
  const {
    quote: firstToSecondQuote,
    isLoading: isFirstToSecondLoading,
    error: firstToSecondError,
  } = useQuote({
    pairAddress: pairAddress || "",
    inputAmount: firstTokenAmount || "0",
    inputTokenAddress: updatedFirstToken?.tokenAddress.toString() || "",
    outputTokenAddress: updatedSecondToken?.tokenAddress.toString() || "",
    inputTokenDecimals: updatedFirstToken?.decimals || 18,
    outputTokenDecimals: updatedSecondToken?.decimals || 18,
    enabled: hasValidQuoteParams && hasFirstAmount,
  })

  // Quote for second token input -> first token output  
  const {
    quote: secondToFirstQuote,
    isLoading: isSecondToFirstLoading,
    error: secondToFirstError,
  } = useQuote({
    pairAddress: pairAddress || "",
    inputAmount: secondTokenAmount || "0",
    inputTokenAddress: updatedSecondToken?.tokenAddress.toString() || "",
    outputTokenAddress: updatedFirstToken?.tokenAddress.toString() || "",
    inputTokenDecimals: updatedSecondToken?.decimals || 18,
    outputTokenDecimals: updatedFirstToken?.decimals || 18,
    enabled: hasValidQuoteParams && hasSecondAmount,
  })

  // Determine which quote to use and aggregate loading/error states
  const quote = hasFirstAmount ? firstToSecondQuote : secondToFirstQuote
  const isQuoteLoading = isFirstToSecondLoading || isSecondToFirstLoading
  const quoteError = firstToSecondError || secondToFirstError

  // Set default tokens when component mounts
  useEffect(() => {
    if (!firstToken && !secondToken) {
      const vetToken = createTokenFromConstant(TOKEN_CONSTANTS.VET)
      const usdgloToken = createTokenFromConstant(TOKEN_CONSTANTS.USDGLO)
      
      setFirstToken(vetToken)
      setSecondToken(usdgloToken)
    }
  }, [firstToken, secondToken])

  // Update second token amount when first token quote is received
  useEffect(() => {
    if (hasFirstAmount && firstToSecondQuote && firstToSecondQuote !== "0" && !isFirstToSecondLoading) {
      const formattedQuote = parseFloat(firstToSecondQuote).toFixed(6)
      if (formattedQuote !== secondTokenAmount) {
        setSecondTokenAmount(formattedQuote)
      }
    }
  }, [firstToSecondQuote, hasFirstAmount, isFirstToSecondLoading])

  // Update first token amount when second token quote is received
  useEffect(() => {
    if (hasSecondAmount && secondToFirstQuote && secondToFirstQuote !== "0" && !isSecondToFirstLoading) {
      const formattedQuote = parseFloat(secondToFirstQuote).toFixed(6)
      if (formattedQuote !== firstTokenAmount) {
        setFirstTokenAmount(formattedQuote)
      }
    }
  }, [secondToFirstQuote, hasSecondAmount, isSecondToFirstLoading])

  const handleTokenSelect = (selectedToken: token) => {
    if (showTokenList === 1) {
      setFirstToken(selectedToken)
    } else if (showTokenList === 2) {
      setSecondToken(selectedToken)
    }
    setShowTokenList(null)
  }

  const swapTokens = () => {
    if (firstToken && secondToken) {
      // Swap the tokens
      const tempToken = firstToken
      setFirstToken(secondToken)
      setSecondToken(tempToken)
      
      // Swap the amounts as well
      const tempAmount = firstTokenAmount
      setFirstTokenAmount(secondTokenAmount)
      setSecondTokenAmount(tempAmount)
    }
  }

  return {
    firstToken: updatedFirstToken,
    secondToken: updatedSecondToken,
    tokens,
    showTokenList,
    isTokensLoading: isVetBalanceLoading || isAllBalancesLoading,
    pairAddress,
    isPairLoading,
    pairError,
    pairTokens,
    isPairTokensLoading,
    pairTokensError,
    firstTokenAmount,
    secondTokenAmount,
    quote,
    isQuoteLoading,
    quoteError,
    reserves,
    isReservesLoading,
    reservesError,
    totalSupply,
    isTotalSupplyLoading,
    totalSupplyError,
    setFirstToken,
    setSecondToken,
    setShowTokenList,
    handleTokenSelect,
    setFirstTokenAmount,
    setSecondTokenAmount,
    swapTokens,
  }
} 