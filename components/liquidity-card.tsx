"use client"

import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTokenSelection } from "./hooks/use-token-selection"
import { useLiquidityAmounts } from "./hooks/use-liquidity-amounts"
import { useWithdrawal } from "./hooks/use-withdrawal"
import { useLiquidityActions } from "./hooks/use-liquidity-actions"
import { hasLPTokens } from "@/lib/liquidity-utils"
import { 
  AddLiquidityTab,
  WithdrawLiquidityTab,
  LoadingState,
  PairInfo
} from "./liquidity"

export default function LiquidityCard() {
  // Token selection hook
  const {
    firstToken,
    secondToken,
    tokens,
    showTokenList,
    isTokensLoading,
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
    setShowTokenList,
    handleTokenSelect,
    setFirstTokenAmount,
    setSecondTokenAmount,
  } = useTokenSelection()

  // Liquidity amounts hook (for exchange rate and pool share calculations only)
  const {
    exchangeRate,
    poolShare,
    isValidAmounts,
  } = useLiquidityAmounts({ 
    firstToken, 
    secondToken, 
    firstTokenAmount, 
    secondTokenAmount 
  })

  // Withdrawal hook
  const {
    withdrawPercentage,
    setWithdrawPercentage,
    estimatedFirstTokenAmount,
    estimatedSecondTokenAmount,
    lpToken,
    isLoading: isWithdrawalLoading,
    error: withdrawalError,
  } = useWithdrawal({ firstToken, secondToken })

  // Actions hook
  const {
    mode,
    setMode,
    handleAddLiquidity,
    handleWithdrawLiquidity,
  } = useLiquidityActions({
    firstToken,
    secondToken,
    firstTokenAmount,
    secondTokenAmount,
    withdrawPercentage,
    estimatedFirstTokenAmount,
    estimatedSecondTokenAmount,
  })

  // Check if user has LP tokens
  const userHasLPTokens = hasLPTokens(lpToken.balance)

  // Handle switching to add liquidity tab
  const handleSwitchToAdd = () => {
    setMode("add")
  }

  if (isTokensLoading) {
    return <LoadingState />
  }

  return (
    <Card className="w-full max-w-md mx-auto border-gray-200 shadow-md">
      <Tabs value={mode} onValueChange={(value) => setMode(value as "add" | "withdraw")}>
        <CardHeader className="pb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Liquidity
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-1">
              <Minus className="h-4 w-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <CardTitle className="text-xl font-semibold mt-4">Add Liquidity</CardTitle>
          </TabsContent>

          <TabsContent value="withdraw">
            <CardTitle className="text-xl font-semibold mt-4">Withdraw Liquidity</CardTitle>
          </TabsContent>
        </CardHeader>

        <CardContent className="space-y-4">
          <TabsContent value="add" className="mt-0 space-y-4">
            <AddLiquidityTab
              firstToken={firstToken}
              secondToken={secondToken}
              tokens={tokens}
              firstTokenAmount={firstTokenAmount}
              secondTokenAmount={secondTokenAmount}
              showTokenList={showTokenList}
              pairAddress={pairAddress}
              quote={quote}
              isQuoteLoading={isQuoteLoading}
              quoteError={quoteError}
              exchangeRate={exchangeRate}
              poolShare={poolShare}
              setFirstTokenAmount={setFirstTokenAmount}
              setSecondTokenAmount={setSecondTokenAmount}
              setShowTokenList={setShowTokenList}
              handleTokenSelect={handleTokenSelect}
            />
          </TabsContent>

          <TabsContent value="withdraw" className="mt-0 space-y-4">
            <WithdrawLiquidityTab
              firstToken={firstToken}
              secondToken={secondToken}
              tokens={tokens}
              showTokenList={showTokenList}
              lpToken={lpToken}
              withdrawPercentage={withdrawPercentage}
              estimatedFirstTokenAmount={estimatedFirstTokenAmount}
              estimatedSecondTokenAmount={estimatedSecondTokenAmount}
              exchangeRate={exchangeRate}
              isLoading={isWithdrawalLoading}
              error={withdrawalError}
              setWithdrawPercentage={setWithdrawPercentage}
              onSwitchToAdd={handleSwitchToAdd}
              onTokenSelect={handleTokenSelect}
              onShowTokenList={setShowTokenList}
            />
          </TabsContent>
        </CardContent>

        <CardFooter>
          <TabsContent value="add" className="mt-0 w-full">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!isValidAmounts || !firstToken || !secondToken}
              onClick={handleAddLiquidity}
            >
              Add Liquidity
            </Button>
          </TabsContent>

          <TabsContent value="withdraw" className="mt-0 w-full">
            <Button
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
              disabled={!userHasLPTokens || withdrawPercentage === 0 || !firstToken || !secondToken || isWithdrawalLoading || !!withdrawalError}
              onClick={handleWithdrawLiquidity}
            >
              {isWithdrawalLoading ? "Loading..." : "Withdraw Liquidity"}
            </Button>
          </TabsContent>
        </CardFooter>
      </Tabs>

      {/* Pair Information Section */}
      <PairInfo
        pairAddress={pairAddress}
        isPairLoading={isPairLoading}
        pairError={pairError}
        pairTokens={pairTokens}
        isPairTokensLoading={isPairTokensLoading}
        pairTokensError={pairTokensError}
        reserves={reserves}
        isReservesLoading={isReservesLoading}
        reservesError={reservesError}
        totalSupply={totalSupply}
        isTotalSupplyLoading={isTotalSupplyLoading}
        totalSupplyError={totalSupplyError}
      />
    </Card>
  )
}
