"use client"

import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTokenSelection } from "./hooks/use-token-selection"
import { useLiquidityActions } from "./hooks/use-liquidity-actions"
import { AddLiquidityForm } from "./forms/add-liquidity-form"
import { 
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
    reserves,
    isReservesLoading,
    reservesError,
    totalSupply,
    isTotalSupplyLoading,
    totalSupplyError,
    setShowTokenList,
    handleTokenSelect,
  } = useTokenSelection()

  // Actions hook
  const {
    mode,
    setMode,
  } = useLiquidityActions({
    firstToken,
    secondToken,
    firstTokenAmount: "",
    secondTokenAmount: "",
    withdrawPercentage: 0,
    estimatedFirstTokenAmount: "",
    estimatedSecondTokenAmount: "",
  })

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
            <AddLiquidityForm />
          </TabsContent>

          <TabsContent value="withdraw" className="mt-0 space-y-4">
            <WithdrawLiquidityTab
              firstToken={firstToken}
              secondToken={secondToken}
              tokens={tokens}
              showTokenList={showTokenList}
              onSwitchToAdd={handleSwitchToAdd}
              onTokenSelect={handleTokenSelect}
              onShowTokenList={setShowTokenList}
            />
          </TabsContent>
        </CardContent>
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
